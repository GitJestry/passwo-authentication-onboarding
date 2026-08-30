import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FOLLOW_UP_PATH } from '@passwo/contracts';
import { App } from './app/App.js';
import './app/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('The application root element is missing.');
}

const initialFollowUpToken =
  window.location.pathname === FOLLOW_UP_PATH
    ? new URLSearchParams(window.location.search).get('token')
    : null;
if (window.location.pathname === FOLLOW_UP_PATH && window.location.search.length > 0) {
  window.history.replaceState(null, '', FOLLOW_UP_PATH);
}

createRoot(rootElement).render(
  <StrictMode>
    <App initialFollowUpToken={initialFollowUpToken} />
  </StrictMode>,
);
