import '@mantine/core/styles.css';
import './styles/index.css';

import { MantineProvider } from '@mantine/core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ROUTES } from './routes.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <RouterProvider router={createBrowserRouter(ROUTES)} />
    </MantineProvider>
  </React.StrictMode>,
);
