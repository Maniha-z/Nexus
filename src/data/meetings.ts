import { Meeting, AvailabilitySlot } from '../types';
import { investors, entrepreneurs } from './users';

export const meetings: Meeting[] = [
  {
    id: 'm1',
    title: 'Strategy sync with TechWave AI',
    organizerId: 'i1',
    participantId: 'e1',
    start: '2026-06-10T10:00:00',
    end: '2026-06-10T10:45:00',
    status: 'confirmed',
    createdAt: '2026-06-04T16:00:00Z',
  },
  {
    id: 'm2',
    title: 'Product demo review',
    organizerId: 'e2',
    participantId: 'i2',
    start: '2026-06-12T14:00:00',
    end: '2026-06-12T14:30:00',
    status: 'requested',
    createdAt: '2026-06-05T09:30:00Z',
  },
  {
    id: 'm3',
    title: 'Investor follow-up',
    organizerId: 'i3',
    participantId: 'e3',
    start: '2026-06-14T11:30:00',
    end: '2026-06-14T12:00:00',
    status: 'confirmed',
    createdAt: '2026-06-05T10:15:00Z',
  },
];

export const availabilitySlots: AvailabilitySlot[] = [
  {
    id: 'a1',
    userId: 'e1',
    date: '2026-06-11',
    start: '09:00',
    end: '11:00',
  },
  {
    id: 'a2',
    userId: 'i1',
    date: '2026-06-13',
    start: '13:00',
    end: '15:00',
  },
  {
    id: 'a3',
    userId: 'e3',
    date: '2026-06-16',
    start: '10:00',
    end: '12:00',
  },
];

export const getMeetingsForUser = (userId: string): Meeting[] => {
  return meetings.filter(meeting => meeting.organizerId === userId || meeting.participantId === userId);
};

export const getConfirmedMeetingsForUser = (userId: string): Meeting[] => {
  return meetings.filter(meeting =>
    (meeting.organizerId === userId || meeting.participantId === userId) && meeting.status === 'confirmed'
  );
};

export const getRequestedMeetingsForUser = (userId: string): Meeting[] => {
  return meetings.filter(meeting =>
    (meeting.organizerId === userId || meeting.participantId === userId) && meeting.status === 'requested'
  );
};

export const createMeetingRequest = (
  organizerId: string,
  participantId: string,
  title: string,
  start: string,
  end: string,
): Meeting => {
  const newMeeting: Meeting = {
    id: `m${meetings.length + 1}`,
    title,
    organizerId,
    participantId,
    start,
    end,
    status: 'requested',
    createdAt: new Date().toISOString(),
  };

  meetings.push(newMeeting);
  return newMeeting;
};

export const respondToMeetingRequest = (meetingId: string, status: 'confirmed' | 'declined'): Meeting | null => {
  const meetingIndex = meetings.findIndex(meeting => meeting.id === meetingId);
  if (meetingIndex === -1) return null;

  meetings[meetingIndex] = {
    ...meetings[meetingIndex],
    status,
  };

  return meetings[meetingIndex];
};

export const getAvailabilityForUser = (userId: string): AvailabilitySlot[] => {
  return availabilitySlots.filter(slot => slot.userId === userId);
};

export const createAvailabilitySlot = (
  userId: string,
  date: string,
  start: string,
  end: string,
): AvailabilitySlot => {
  const newSlot: AvailabilitySlot = {
    id: `a${availabilitySlots.length + 1}`,
    userId,
    date,
    start,
    end,
  };

  availabilitySlots.push(newSlot);
  return newSlot;
};

export const updateAvailabilitySlot = (
  slotId: string,
  date: string,
  start: string,
  end: string,
): AvailabilitySlot | null => {
  const slotIndex = availabilitySlots.findIndex(slot => slot.id === slotId);
  if (slotIndex === -1) return null;

  availabilitySlots[slotIndex] = {
    ...availabilitySlots[slotIndex],
    date,
    start,
    end,
  };

  return availabilitySlots[slotIndex];
};

export const deleteAvailabilitySlot = (slotId: string): boolean => {
  const index = availabilitySlots.findIndex(slot => slot.id === slotId);
  if (index === -1) return false;
  availabilitySlots.splice(index, 1);
  return true;
};

export const getCounterparts = (role: 'entrepreneur' | 'investor') => {
  return role === 'entrepreneur' ? investors : entrepreneurs;
};
