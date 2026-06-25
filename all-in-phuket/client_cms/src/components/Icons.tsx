// https://tabler.io/icons

export const PlusCircleIcon = ({
  color = 'currentColor',
  size = 24,
}: {
  color?: string;
  size?: number;
}) => {
  return (
    <div style={{ height: size, width: size }}>
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    </div>
  );
};

export const HomeIcon = ({
  color = 'currentColor',
  size = 24,
}: {
  color?: string;
  size?: number;
}) => {
  return (
    <div style={{ height: size, width: size }}>
      <svg
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke={color}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
        <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
      </svg>
    </div>
  );
};

export const HomeDolarIcon = ({
  color = 'currentColor',
  size = 24,
}: {
  color?: string;
  size?: number;
}) => {
  return (
    <div style={{ height: size, width: size }}>
      <svg
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke={color}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M19 10l-7 -7l-9 9h2v7a2 2 0 0 0 2 2h6" />
        <path d="M9 21v-6a2 2 0 0 1 2 -2h2c.387 0 .748 .11 1.054 .3" />
        <path d="M21 15h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" />
        <path d="M19 21v1m0 -8v1" />
      </svg>
    </div>
  );
};
