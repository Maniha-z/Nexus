import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MeetingCalendar } from '../../components/calendar/MeetingCalendar';
import { Calendar, Clock3, Plus, Send, Trash2 } from 'lucide-react';
import {
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  getAvailabilityForUser,
  getConfirmedMeetingsForUser,
  getCounterparts,
  getRequestedMeetingsForUser,
  respondToMeetingRequest,
  createMeetingRequest,
  updateAvailabilitySlot,
} from '../../data/meetings';
import { AvailabilitySlot, Meeting } from '../../types';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [confirmedMeetings, setConfirmedMeetings] = useState<Meeting[]>([]);
  const [pendingMeetings, setPendingMeetings] = useState<Meeting[]>([]);
  const [selectedCounterpart, setSelectedCounterpart] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingStart, setMeetingStart] = useState('09:00');
  const [meetingEnd, setMeetingEnd] = useState('09:30');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [availabilityStart, setAvailabilityStart] = useState('09:00');
  const [availabilityEnd, setAvailabilityEnd] = useState('10:00');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) return;

    setAvailability(getAvailabilityForUser(user.id));
    setConfirmedMeetings(getConfirmedMeetingsForUser(user.id));
    setPendingMeetings(getRequestedMeetingsForUser(user.id));
    const today = new Date().toISOString().slice(0, 10);
    setAvailabilityDate(today);
    setMeetingDate(today);
    setSelectedCounterpart(getCounterparts(user.role)[0]?.id || '');
  }, [user]);

  const counterparts = useMemo(() => {
    return user ? getCounterparts(user.role) : [];
  }, [user]);

  const currentUserRoleLabel = user?.role === 'entrepreneur' ? 'Investor' : 'Entrepreneur';
  const meetingSummary = confirmedMeetings.length;

  const handleAvailabilitySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    if (selectedSlotId) {
      updateAvailabilitySlot(selectedSlotId, availabilityDate, availabilityStart, availabilityEnd);
    } else {
      createAvailabilitySlot(user.id, availabilityDate, availabilityStart, availabilityEnd);
    }

    setAvailability(getAvailabilityForUser(user.id));
    setSelectedSlotId(null);
    setAvailabilityStart('09:00');
    setAvailabilityEnd('10:00');
  };

  const handleEditSlot = (slotId: string) => {
    const slot = getAvailabilityForUser(user!.id).find((slotItem) => slotItem.id === slotId);
    if (!slot) return;
    setSelectedSlotId(slot.id);
    setAvailabilityDate(slot.date);
    setAvailabilityStart(slot.start);
    setAvailabilityEnd(slot.end);
  };

  const handleDeleteSlot = (slotId: string) => {
    deleteAvailabilitySlot(slotId);
    setAvailability(getAvailabilityForUser(user!.id));
    if (selectedSlotId === slotId) {
      setSelectedSlotId(null);
      setAvailabilityStart('09:00');
      setAvailabilityEnd('10:00');
    }
  };

  const handleMeetingRequestSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !selectedCounterpart || !meetingDate) return;

    const start = `${meetingDate}T${meetingStart}`;
    const end = `${meetingDate}T${meetingEnd}`;
    const title = `${currentUserRoleLabel} meeting request`;
    const organizerId = user.id;
    const participantId = selectedCounterpart;

    createMeetingRequest(organizerId, participantId, title, start, end);
    setPendingMeetings(getRequestedMeetingsForUser(user.id));
  };

  const handleRespond = (meetingId: string, status: 'confirmed' | 'declined') => {
    respondToMeetingRequest(meetingId, status);
    setPendingMeetings(getRequestedMeetingsForUser(user!.id));
    setConfirmedMeetings(getConfirmedMeetingsForUser(user!.id));
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meeting Calendar</h1>
          <p className="text-gray-600">Manage availability, requests, and confirmed meetings from one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700">
            <Calendar size={16} /> Confirmed meetings
            <Badge variant="success" className="ml-2">{meetingSummary}</Badge>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-2 text-sm font-medium text-accent-700">
            <Clock3 size={16} /> Available slots
            <Badge variant="accent" className="ml-2">{availability.length}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Calendar overview</h2>
                <p className="text-sm text-gray-500">Confirmed meetings are displayed in blue. Pending requests are highlighted in yellow.</p>
              </div>
            </div>
            <MeetingCalendar meetings={[...confirmedMeetings, ...pendingMeetings]} />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Availability slots</h2>
                <p className="text-sm text-gray-500">Add or update your available meeting times.</p>
              </div>
              <Badge variant="primary">{availability.length}</Badge>
            </div>

            <form className="space-y-4" onSubmit={handleAvailabilitySubmit}>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                  value={availabilityDate}
                  onChange={(e) => setAvailabilityDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Start time</label>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    value={availabilityStart}
                    onChange={(e) => setAvailabilityStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">End time</label>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    value={availabilityEnd}
                    onChange={(e) => setAvailabilityEnd(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" leftIcon={<Plus size={16} />}>
                {selectedSlotId ? 'Update slot' : 'Add availability'}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              {availability.length === 0 ? (
                <p className="text-sm text-gray-500">No availability slots yet. Add one to start receiving requests.</p>
              ) : (
                availability.map((slot: any) => (
                  <div key={slot.id} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-slate-50 p-3">
                    <div>
                      <p className="font-medium text-gray-900">{slot.date}</p>
                      <p className="text-sm text-gray-600">{slot.start} - {slot.end}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-xl border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700"
                        onClick={() => handleEditSlot(slot.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-700"
                        onClick={() => handleDeleteSlot(slot.id)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Meeting requests</h2>
                <p className="text-sm text-gray-500">Send a request or respond to incoming meetings.</p>
              </div>
              <Badge variant="accent">{pendingMeetings.length}</Badge>
            </div>

            <form className="space-y-4" onSubmit={handleMeetingRequestSubmit}>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Request to</label>
                <select
                  value={selectedCounterpart}
                  onChange={(e) => setSelectedCounterpart(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                >
                  {counterparts.map((person: any) => (
                    <option key={person.id} value={person.id}>{person.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Start</label>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    value={meetingStart}
                    onChange={(e) => setMeetingStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">End</label>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    value={meetingEnd}
                    onChange={(e) => setMeetingEnd(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" leftIcon={<Send size={16} />}>
                Send request
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              {pendingMeetings.length === 0 ? (
                <p className="text-sm text-gray-500">No pending meeting requests at this time.</p>
              ) : (
                pendingMeetings.map((meeting: any) => (
                  <div key={meeting.id} className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{meeting.title}</p>
                        <p className="text-sm text-gray-600">{meeting.start.slice(0, 16).replace('T', ' ')} – {meeting.end.slice(0, 16).replace('T', ' ')}</p>
                      </div>
                      <Badge variant={meeting.status === 'requested' ? 'warning' : 'success'}>
                        {meeting.status}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {meeting.participantId === user.id && meeting.status === 'requested' ? (
                        <>
                          <Button variant="success" size="sm" onClick={() => handleRespond(meeting.id, 'confirmed')}>
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRespond(meeting.id, 'declined')}>
                            Decline
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-gray-600">Request by {meeting.organizerId === user.id ? 'you' : 'them'}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
