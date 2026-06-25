import { useStoreUserActivities } from '../states/stateUserActivity.state';
import type { UserActivity } from '../types/activity.type';

export const TIME_SLOT_DURATION = 1800; // In seconds

export function filterAvailableSlotsForDuration(
  selectedDuration: number,
  timeSlots: Record<string, string>,
  userActivityRecords: Record<string, UserActivity[]>
) {
  const durationSlots = selectedDuration / TIME_SLOT_DURATION;
  const newTimeSlots = { ...timeSlots };

  Object.entries(userActivityRecords).forEach(([k, v]) => {
    for (const activity of v) {
      if (newTimeSlots[activity.date]) {
        delete newTimeSlots[activity.date];

        const numIncrements = Math.ceil(activity.duration / TIME_SLOT_DURATION);
        if (numIncrements > 1) {
          const timeSlotDate = new Date(activity.date);
          for (let i = 1; i < numIncrements; i++) {
            timeSlotDate.setMinutes(timeSlotDate.getMinutes() + 30);
            delete newTimeSlots[timeSlotDate.toISOString()];
          }
        }
      }
    }
  });

  console.log('newTimeSlots', JSON.stringify(newTimeSlots, null, 2));
}

filterAvailableSlotsForDuration(
  7200, // 4 hours
  {
    '2024-01-03T01:00:00.000Z': 'Wednesday, January, 3rd, 8:00 AM',
    '2024-01-03T01:30:00.000Z': 'Wednesday, January, 3rd, 8:30 AM',
    '2024-01-03T02:00:00.000Z': 'Wednesday, January, 3rd, 9:00 AM',
    '2024-01-03T02:30:00.000Z': 'Wednesday, January, 3rd, 9:30 AM',
    '2024-01-03T05:00:00.000Z': 'Wednesday, January, 3rd, 12:00 PM',
    '2024-01-03T05:30:00.000Z': 'Wednesday, January, 3rd, 12:30 PM',
    '2024-01-03T06:00:00.000Z': 'Wednesday, January, 3rd, 1:00 PM',
    '2024-01-03T06:30:00.000Z': 'Wednesday, January, 3rd, 1:30 PM',
    '2024-01-03T07:00:00.000Z': 'Wednesday, January, 3rd, 2:00 PM',
    '2024-01-03T07:30:00.000Z': 'Wednesday, January, 3rd, 2:30 PM',
    '2024-01-03T08:00:00.000Z': 'Wednesday, January, 3rd, 3:00 PM',
    '2024-01-03T08:30:00.000Z': 'Wednesday, January, 3rd, 3:30 PM',
    '2024-01-03T09:00:00.000Z': 'Wednesday, January, 3rd, 4:00 PM',
    '2024-01-03T09:30:00.000Z': 'Wednesday, January, 3rd, 4:30 PM',
    '2024-01-03T10:00:00.000Z': 'Wednesday, January, 3rd, 5:00 PM',
    '2024-01-03T10:30:00.000Z': 'Wednesday, January, 3rd, 5:30 PM',
    '2024-01-03T11:00:00.000Z': 'Wednesday, January, 3rd, 6:00 PM',
    '2024-01-03T11:30:00.000Z': 'Wednesday, January, 3rd, 6:30 PM',
    '2024-01-03T12:00:00.000Z': 'Wednesday, January, 3rd, 7:00 PM',
    '2024-01-03T12:30:00.000Z': 'Wednesday, January, 3rd, 7:30 PM',
    '2024-01-03T13:00:00.000Z': 'Wednesday, January, 3rd, 8:00 PM',
    '2024-01-03T13:30:00.000Z': 'Wednesday, January, 3rd, 8:30 PM',
    '2024-01-03T14:00:00.000Z': 'Wednesday, January, 3rd, 9:00 PM',
    '2024-01-03T14:30:00.000Z': 'Wednesday, January, 3rd, 9:30 PM',
  },
  {
    '2024-01-02': [{ activity: 'Surfing', date: '2024-01-03T03:00:00.000Z', duration: 7200 }],
  }
);
