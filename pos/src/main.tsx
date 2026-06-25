import React from 'react';

import { createEmotionCache, MantineProvider } from '@mantine/core';
import ReactDOM from 'react-dom/client';

import { App } from './App';

import './styles/_index.css';

const appendCache = createEmotionCache({ key: 'mantine', prepend: false });

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider emotionCache={appendCache} withGlobalStyles withNormalizeCSS>
      <App />
    </MantineProvider>
  </React.StrictMode>
);
