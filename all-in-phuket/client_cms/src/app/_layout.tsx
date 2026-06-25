import { NavLink, Outlet } from 'react-router-dom';

import { ROUTES } from '../routes';
import { Color, Style } from '../styles/base.style';

export const RootLayout = () => {
  return (
    <div className="flex">
      <div
        className="flex h-[100vh] min-w-[220px] flex-col gap-4 p-4"
        style={{ backgroundColor: Color.BgDarker }}
      >
        {ROUTES[0]?.children.map((route) => {
          return (
            <NavLink
              key={route.id}
              className={({ isActive }) => (isActive ? 'active' : '')}
              style={{
                alignItems: 'center',
                borderRadius: Style.RadiusSm,
                display: 'flex',
                gap: '4px',
                padding: '12px',
              }}
              to={route.path}
            >
              {route.icon}
              {route.id}
            </NavLink>
          );
        })}
      </div>

      <div className="h-[100vh] overflow-auto p-4">
        <Outlet />
      </div>
    </div>
  );
};
