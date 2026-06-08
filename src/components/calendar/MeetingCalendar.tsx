import React, { useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import { Meeting } from '../../types';
import { findUserById } from '../../data/users';
import { Badge } from '../ui/Badge';
import 'react-calendar/dist/Calendar.css';

interface MeetingCalendarProps {
  meetings: Meeting[];
}

export const MeetingCalendar: React.FC<MeetingCalendarProps> = ({ meetings }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    meetings.forEach(meeting => {
      const dateKey = meeting.start.slice(0, 10);
      const list = map.get(dateKey) || [];
      list.push(meeting);
      map.set(dateKey, list);
    });
    return map;
  }, [meetings]);

  const selectedDateKey = selectedDate.toISOString().slice(0, 10);
  const selectedEvents = eventsByDate.get(selectedDateKey) || [];

  const tileContent = ({ date }: { date: Date }) => {
    const dateKey = date.toISOString().slice(0, 10);
    const eventCount = eventsByDate.get(dateKey)?.length ?? 0;
    return eventCount > 0 ? (
      <div className="mt-1 flex items-center justify-center text-[0.65rem] text-white">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-600">{eventCount}</span>
      </div>
    ) : null;
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            className="rounded-3xl border border-gray-200"
            tileClassName={({ date }) => {
              const key = date.toISOString().slice(0, 10);
              return eventsByDate.has(key) ? 'bg-primary-50' : '';
            }}
            tileContent={tileContent}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-gray-600">Selected date</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{selectedDate.toDateString()}</p>
            <p className="text-sm text-gray-500">{selectedEvents.length} event{selectedEvents.length === 1 ? '' : 's'}</p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-4">
            <h3 className="text-base font-semibold text-gray-900">Events</h3>
            {selectedEvents.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No meetings scheduled for this day.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {selectedEvents.map(event => (
                  <div key={event.id} className="rounded-2xl border border-gray-200 p-3">
                    <p className="font-semibold text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.start.slice(11, 16)} - {event.end.slice(11, 16)}</p>
                    <p className="text-sm text-gray-500 mt-1">{findUserById(event.organizerId)?.name} → {findUserById(event.participantId)?.name}</p>
                    <Badge
                      variant={event.status === 'confirmed' ? 'success' : 'warning'}
                      className="mt-2"
                    >
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
