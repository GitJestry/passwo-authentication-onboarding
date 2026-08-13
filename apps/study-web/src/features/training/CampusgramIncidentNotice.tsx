import { s04Content } from '@passwo/training-content';
import styles from './CampusgramIncidentNotice.module.css';

function IncidentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4.5c5.7 4.2 11.6 6.3 17.5 6.8v11.2c0 10.3-6.4 17.6-17.5 21-11.1-3.4-17.5-10.7-17.5-21V11.3C12.4 10.8 18.3 8.7 24 4.5Z"
        fill="currentColor"
        opacity=".14"
      />
      <path
        d="M24 4.5c5.7 4.2 11.6 6.3 17.5 6.8v11.2c0 10.3-6.4 17.6-17.5 21-11.1-3.4-17.5-10.7-17.5-21V11.3C12.4 10.8 18.3 8.7 24 4.5Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path d="M24 14v13" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="24" cy="34" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function CampusgramIncidentNotice() {
  return (
    <section className={styles.serviceNotice} role="alert">
      <span className={styles.incidentIcon} aria-hidden="true">
        <IncidentIcon />
      </span>
      <div>
        <h2>{s04Content.notice.title}</h2>
        <p>{s04Content.notice.paragraphs[0]}</p>
      </div>
    </section>
  );
}
