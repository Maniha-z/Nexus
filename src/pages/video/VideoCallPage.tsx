import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Video, Copy, MicOff, Mic, VideoOff, Video as VideoIcon, Monitor, MessageCircle, Users, LayoutDashboard, Play, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ScheduledCall {
  id: string;
  title: string;
  date: string;
  time: string;
  host: string;
  participants: number;
  status: 'Upcoming' | 'Ready';
}

interface ChatMessage {
  id: string;
  author: string;
  content: string;
  time: string;
  isOwn?: boolean;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  speaking: boolean;
}

const generateMeetingId = () => `MTG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

export const VideoCallPage: React.FC = () => {
  const [meetingId, setMeetingId] = useState(generateMeetingId());
  const [meetingName, setMeetingName] = useState('Team Sync');
  const [roomCode, setRoomCode] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'c1', author: 'Avery', content: 'I just shared the latest deck', time: '2:14 PM' },
    { id: 'c2', author: 'Jordan', content: 'Looks great — ready to review the next milestone', time: '2:15 PM' },
  ]);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'p1', name: 'Avery', role: 'Host', speaking: true },
    { id: 'p2', name: 'Jordan', role: 'Investor', speaking: false },
    { id: 'p3', name: 'Morgan', role: 'Entrepreneur', speaking: false },
  ]);

  const stats = useMemo(() => [
    { label: 'Weekly calls', value: '14', icon: LayoutDashboard },
    { label: 'Active users', value: '27', icon: Users },
    { label: 'Avg call time', value: '22m', icon: Monitor },
  ], []);

  const scheduledCalls: ScheduledCall[] = [
    { id: 'SNG-921', title: 'Investor follow-up', date: 'Jun 11', time: '10:00 AM', host: 'Avery', participants: 4, status: 'Upcoming' },
    { id: 'SNG-822', title: 'Product review', date: 'Jun 12', time: '2:30 PM', host: 'Jordan', participants: 3, status: 'Upcoming' },
    { id: 'SNG-799', title: 'Contract sync', date: 'Jun 14', time: '11:00 AM', host: 'Morgan', participants: 5, status: 'Ready' },
  ];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isInCall) {
      setElapsedSeconds(0);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds(seconds => seconds + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isInCall]);

  useEffect(() => {
    const handleEscape = () => {
      if (isFullscreen) setIsFullscreen(false);
    };

    window.addEventListener('keyup', handleEscape);
    return () => window.removeEventListener('keyup', handleEscape);
  }, [isFullscreen]);

  const copyMeetingId = async () => {
    try {
      await navigator.clipboard.writeText(meetingId);
      toast.success('Meeting ID copied to clipboard');
    } catch {
      toast.error('Unable to copy meeting ID');
    }
  };

  const startMeeting = () => {
    if (!meetingId) setMeetingId(generateMeetingId());
    setIsInCall(true);
  };

  const joinMeeting = () => {
    if (roomCode.trim() === '') {
      toast.error('Enter a meeting ID to join');
      return;
    }
    setMeetingId(roomCode.trim());
    setIsInCall(true);
  };

  const endCall = () => {
    setIsInCall(false);
    setIsScreenShared(false);
    setIsFullscreen(false);
    setIsMuted(false);
    setIsVideoOn(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { id: `c-${Date.now()}`, author: 'You', content: chatInput.trim(), time: 'Now', isOwn: true },
    ]);
    setChatInput('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Calling Suite</h1>
          <p className="text-gray-600">Lobby, live call simulation, chat, and participant controls for your next meeting.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-700">
                <Icon size={16} className="text-primary-600" />
                <span>{stat.label}: <strong>{stat.value}</strong></span>
              </div>
            );
          })}
        </div>
      </div>

      {!isInCall ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Lobby</h2>
                <p className="text-sm text-gray-500">Start or join a mock call with meeting controls and room access.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-primary-700">
                <Video size={16} /> Your meeting ID
                <Badge variant="primary" className="ml-2">{meetingId}</Badge>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Create a new call</h3>
                  <p className="text-sm text-gray-600 mb-4">Generate a unique meeting ID and enter the call lobby.</p>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Button variant="primary" onClick={startMeeting} leftIcon={<Play size={16} />}>
                      Start Meeting
                    </Button>
                    <Button variant="outline" onClick={copyMeetingId} leftIcon={<Copy size={16} />}>
                      Copy ID
                    </Button>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Join existing call</h3>
                  <p className="text-sm text-gray-600 mb-4">Paste a valid meeting ID from your team to join.</p>
                  <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); joinMeeting(); }}>
                    <Input
                      label="Meeting ID"
                      placeholder="Enter meeting ID"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      fullWidth
                    />
                    <Button type="submit" variant="secondary" className="w-full">
                      Join Meeting
                    </Button>
                  </form>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Upcoming Calls</h3>
                    <Badge variant="primary">{scheduledCalls.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {scheduledCalls.map(call => (
                      <div key={call.id} className="rounded-3xl border border-slate-200 p-4 hover:border-primary-300 transition">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{call.title}</p>
                            <p className="text-sm text-slate-500">{call.date} · {call.time}</p>
                          </div>
                          <Badge variant={call.status === 'Ready' ? 'success' : 'accent'}>{call.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-3">Host: {call.host} · Participants: {call.participants}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Live call activity</h3>
                  <div className="space-y-4">
                    <div className="rounded-3xl bg-primary-50 p-4">
                      <p className="text-sm text-primary-700">Active speakers</p>
                      <p className="mt-2 text-xl font-semibold text-primary-900">{participants.filter(p => p.speaking).length} currently speaking</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">Meeting theme</p>
                      <p className="mt-2 font-semibold text-slate-900">{meetingName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Call controls</h2>
                <Badge variant="secondary">Lobby</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Meeting ID</p>
                  <p className="mt-2 font-semibold text-slate-900">{meetingId}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Call timer</p>
                  <p className="mt-2 font-semibold text-slate-900">{formatTime(elapsedSeconds)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Meeting quick tips</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>• Use the meeting ID to share access with stakeholders.</li>
                <li>• Mute when not speaking and turn video off to save bandwidth.</li>
                <li>• Screen share can be toggled during the live call.</li>
                <li>• Active call panels show speaker status and chat history.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6' : ''}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Live Meeting</h2>
              <p className="text-sm text-slate-300">Meeting ID: {meetingId}</p>
            </div>
            <div className="inline-flex items-center gap-3">
              <Badge variant="success">Live</Badge>
              <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                <span className="mr-2 h-2 w-2 rounded-full bg-green-400" />
                {formatTime(elapsedSeconds)}
              </span>
              <Button variant="outline" onClick={() => setIsFullscreen(prev => !prev)}>
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.75fr_0.9fr] gap-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participants.map((participant, index) => (
                  <div key={participant.id} className={`rounded-3xl p-6 text-white ${index === 0 ? 'bg-gradient-to-br from-primary-600 to-sky-500' : 'bg-gradient-to-br from-slate-800 to-slate-700'} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.35),_transparent_30%)]" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.2em] text-slate-200 opacity-80">{participant.role}</p>
                          <h3 className="mt-3 text-xl font-semibold">{participant.name}</h3>
                        </div>
                        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${participant.speaking ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-900 text-slate-200'}`}>
                          {participant.speaking ? 'Speaking' : 'Muted'}
                        </div>
                      </div>
                      <div className="mt-6 rounded-3xl bg-slate-900/60 p-4 text-sm text-slate-200">
                        {participant.speaking
                          ? 'Sharing thoughts on the latest investment criteria.'
                          : 'Waiting to contribute.'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-gray-200 bg-slate-900/90 backdrop-blur p-6 text-slate-100 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Screen share</h3>
                  <Badge variant={isScreenShared ? 'success' : 'warning'}>{isScreenShared ? 'Active' : 'Off'}</Badge>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6">
                  <p className="font-medium text-slate-100">{isScreenShared ? 'Presenting your screen to the room' : 'No screen sharing currently active'}</p>
                  <p className="mt-3 text-sm text-slate-400">Use the toggle below to simulate sharing your screen in the active call.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">In-call chat</h3>
                  <Badge variant="primary">{chatMessages.length}</Badge>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pb-3">
                  {chatMessages.map(message => (
                    <div key={message.id} className={`rounded-3xl p-3 ${message.isOwn ? 'bg-primary-50 text-slate-900' : 'bg-slate-50 text-slate-800'}`}>
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>{message.author}</span>
                        <span className="text-slate-500">{message.time}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6">{message.content}</p>
                    </div>
                  ))}
                </div>
                <form className="mt-4 flex gap-3" onSubmit={sendMessage}>
                  <Input
                    placeholder="Send a message"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    fullWidth
                  />
                  <Button type="submit">Send</Button>
                </form>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Participants</h3>
                  <span className="text-sm text-slate-500">{participants.length} in call</span>
                </div>
                <div className="space-y-3">
                  {participants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between rounded-3xl border border-slate-200 px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{participant.name}</p>
                        <p className="text-sm text-slate-500">{participant.role}</p>
                      </div>
                      <span className={`h-3.5 w-3.5 rounded-full ${participant.speaking ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Button variant={isMuted ? 'warning' : 'success'} onClick={() => setIsMuted(prev => !prev)} className="w-full">
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />} {isMuted ? 'Unmute' : 'Mute'}
              </Button>
              <Button variant={isVideoOn ? 'success' : 'warning'} onClick={() => setIsVideoOn(prev => !prev)} className="w-full">
                {isVideoOn ? <VideoIcon size={16} /> : <VideoOff size={16} />} {isVideoOn ? 'Video On' : 'Video Off'}
              </Button>
              <Button variant={isScreenShared ? 'success' : 'accent'} onClick={() => setIsScreenShared(prev => !prev)} className="w-full">
                <Monitor size={16} /> {isScreenShared ? 'Stop Share' : 'Share Screen'}
              </Button>
              <Button variant="error" onClick={endCall} className="w-full">
                <LogOut size={16} /> End Call
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
