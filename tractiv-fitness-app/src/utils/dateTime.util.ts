import type { UserActivity } from '../types/activity.type';

export const TIME_SLOT_DURATION = 1800; // In seconds

function addSuffixToNumber(num: number): string {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const remainder = num % 100;
  return num + (suffix[(remainder - 20) % 10] || suffix[remainder] || suffix[0]);
}

export function generateTimeSlots() {
  const timeSlots: Record<string, string> = {};
  const currentDate = new Date();
  const slotsForEachDay: Record<string, number> = {};

  // Move currentDate to the next 30-minute slot
  currentDate.setMinutes(currentDate.getMinutes() + 30 - (currentDate.getMinutes() % 30));

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7); // Set the end date to two days from now

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthsOfYear = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  while (currentDate <= endDate) {
    const dayKey = currentDate.toISOString().split('T')[0]; // Extracting only the date part
    const dayOfWeek = daysOfWeek[currentDate.getDay()];
    const monthOfYear = monthsOfYear[currentDate.getMonth()];
    const dayOfMonth = addSuffixToNumber(currentDate.getDate()); // Adding suffix to day

    const timeSlotDate = new Date(currentDate);
    let slotsAvailable = 0;

    for (let hour = currentDate.getHours(); hour < 24; hour++) {
      // Skip hours between 22:00 and 08:00
      if (hour >= 8 && hour < 22) {
        for (
          let minute = hour === currentDate.getHours() ? currentDate.getMinutes() : 0;
          minute < 60;
          minute += 30
        ) {
          timeSlotDate.setHours(hour, minute, 0, 0); // Set the time part of the date

          const formattedDateString = `${dayOfWeek}, ${monthOfYear}, ${dayOfMonth}, ${timeSlotDate.toLocaleString(
            'en-US',
            { hour: 'numeric', minute: '2-digit', hour12: true }
          )}`;

          // Use the formattedDateString as the value, and the timeSlotDate as the key
          timeSlots[timeSlotDate.toISOString()] = formattedDateString;
          slotsAvailable++;
        }
      }
    }

    if (slotsAvailable > 0) {
      slotsForEachDay[dayKey] = slotsAvailable;
    }

    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    currentDate.setHours(8, 0, 0, 0); // Reset the hours to 8:00 AM for the next day
  }

  return { timeSlots, slotsForEachDay };
}

type AllSlots = Record<string, string>;

export function filterAvailableSlots(
  allSlots: AllSlots,
  existingSlots: Record<string, UserActivity[]>
): AllSlots {
  const filteredSlots: AllSlots = allSlots;

  Object.entries(existingSlots).forEach(([k, v]) => {
    for (const activity of v) {
      if (filteredSlots[activity.date]) {
        delete filteredSlots[activity.date];

        const numIncrements = Math.ceil(activity.duration / TIME_SLOT_DURATION);
        if (numIncrements > 1) {
          const timeSlotDate = new Date(activity.date);
          for (let i = 1; i < numIncrements; i++) {
            timeSlotDate.setMinutes(timeSlotDate.getMinutes() + 30);
            delete filteredSlots[timeSlotDate.toISOString()];
          }
        }
      }
    }
  });

  return filteredSlots;
}
