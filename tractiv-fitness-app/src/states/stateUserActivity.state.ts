import { create } from 'zustand';

import type { UserActivity } from '../types/activity.type';
import { filterAvailableSlots, generateTimeSlots } from '../utils/dateTime.util';

type T = {
  userActivityRecords: Record<string, UserActivity[]>;
  addActivity: (activity: UserActivity) => void;

  initTimeSlots: () => void;
  timeSlots: Record<string, string>;
  slotsForEachDay: Record<string, number>;
};

export const useStoreUserActivities = create<T>((set, get): T => {
  return {
    userActivityRecords: {},
    addActivity: (activity) => {
      const currentDate = activity.date.split('T')[0];
      const currentActivities = get().userActivityRecords[currentDate] || [];

      // Combine the existing and new activities
      const updatedActivities = [...currentActivities, activity];

      // Sort the activities by date
      updatedActivities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Create a new object with the updated activities
      const newObj = { ...get().userActivityRecords, [currentDate]: updatedActivities };

      // Sort the object by date
      const sortedObject = Object.fromEntries(
        Object.entries(newObj).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      );

      set({ userActivityRecords: sortedObject });
    },

    initTimeSlots: () => {
      const userActivityRecords = get().userActivityRecords;
      const { timeSlots, slotsForEachDay } = generateTimeSlots();
      const filteredSlots = filterAvailableSlots(timeSlots, userActivityRecords);
      set({ timeSlots: filteredSlots, slotsForEachDay });
    },

    timeSlots: {},
    slotsForEachDay: {},
  };
});
