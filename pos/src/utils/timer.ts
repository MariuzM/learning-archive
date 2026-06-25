import { useEffect, useState } from 'react';

import dayjs from 'dayjs';

export const useClock = () => {
  const [currentTime, currentTimeSet] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => currentTimeSet(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (currentTime) {
    return {
      time: dayjs(currentTime).format('HH:mm:ss'),
      date: dayjs(currentTime).format('YYYY.MM.DD'),
    };
  }
};
