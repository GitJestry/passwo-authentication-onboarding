import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FOLLOW_UP_PATH, liveQaFollowUpPath } from '@passwo/contracts';
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
const initialLiveQaFollowUpToken =
  window.location.pathname === liveQaFollowUpPath
    ? new URLSearchParams(window.location.search).get('token')
    : null;
const tokenRoute =
  window.location.pathname === FOLLOW_UP_PATH
    ? FOLLOW_UP_PATH
    : window.location.pathname === liveQaFollowUpPath
      ? liveQaFollowUpPath
      : null;
if (tokenRoute !== null && window.location.search.length > 0) {
  window.history.replaceState(null, '', tokenRoute);
}

createRoot(rootElement).render(
  <StrictMode>
    <App
      initialFollowUpToken={initialFollowUpToken}
      initialLiveQaFollowUpToken={initialLiveQaFollowUpToken}
    />
  </StrictMode>,
);
