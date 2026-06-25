export type Activity = {
  id: number;
  icon: ({ isPressed }: { isPressed?: boolean }) => JSX.Element;
  image: any;
  name: string;
  subtitle: string;
};

export type UserActivity = {
  activity: string;
  duration: number;
  date: string;
};
