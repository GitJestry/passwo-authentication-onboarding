import type { SceneNode, SceneNodeStatus } from '@passwo/visualization';

interface NetworkSymbolProps {
  readonly symbolId: string;
  readonly className?: string | undefined;
}

const symbolIdByNodeId: Readonly<Record<string, string>> = {
  'master-campus': 'master-campus',
  'campus-email': 'campus-email',
  'campusgram': 'campusgram',
};

const detailSymbolIds = new Set([
  'campus-workspace',
  'campus-services',
  'campus-cloud',
  'notifications',
  'confirmations',
  'reset-links',
  'compose-message',
  'direct-messages',
  'groups-contacts',
  'posts-reactions',
]);

const conceptEmailSymbolIds = new Set(['confirmations', 'reset-links']);

export function resolveNetworkSymbolId(node: Pick<SceneNode, 'id' | 'kind' | 'symbolId'>): string {
  return node.symbolId ?? symbolIdByNodeId[node.id] ?? node.kind;
}

function SymbolPaths({ symbolId }: Pick<NetworkSymbolProps, 'symbolId'>) {
  switch (symbolId) {
    case 'master-campus':
      return (
        <>
          <path
            d="m2.5 9.4 9.5-4.8 9.5 4.8-9.5 4.8-9.5-4.8Z"
            fill="#9d2046"
            stroke="none"
          />
          <path
            d="M6.7 11.5v4.1c2.8 2.1 7.8 2.1 10.6 0v-4.1L12 14.2l-5.3-2.7Z"
            fill="#9d2046"
            stroke="none"
          />
          <path
            d="M19 10.2v5.2M19 15.4c0 .8-.6 1.3-1.2 1.3s-1.2-.5-1.2-1.3.6-1.3 1.2-1.3 1.2.5 1.2 1.3Z"
            stroke="#9d2046"
            strokeWidth="1.35"
          />
        </>
      );
    case 'campus-email':
      return (
        <>
          <circle cx="12" cy="12" r="9.3" stroke="#e97716" strokeWidth="1.35" />
          <rect
            x="6.2"
            y="8"
            width="11.6"
            height="8"
            rx="1.35"
            stroke="#e97716"
            strokeWidth="1.35"
          />
          <path d="m6.8 9 5.2 4 5.2-4" stroke="#e97716" strokeWidth="1.35" />
        </>
      );
    case 'campusgram':
      return (
        <>
          <defs>
            <linearGradient
              id="campusgram-gradient"
              x1="4"
              y1="20"
              x2="20"
              y2="4"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#f7a63a" />
              <stop offset="0.45" stopColor="#dc4d85" />
              <stop offset="1" stopColor="#7a5bc4" />
            </linearGradient>
          </defs>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5.4"
            fill="url(#campusgram-gradient)"
            stroke="none"
          />
          <circle cx="12" cy="12" r="5.15" stroke="white" strokeWidth="1.35" />
          <circle cx="10.15" cy="10.8" r="0.62" fill="white" stroke="none" />
          <circle cx="13.85" cy="10.8" r="0.62" fill="white" stroke="none" />
          <path
            d="M9.45 13.35c.75 1.15 1.55 1.7 2.55 1.7s1.8-.55 2.55-1.7"
            stroke="white"
            strokeWidth="1.35"
          />
        </>
      );
    case 'my-shop':
      return (
        <>
          <path
            d="M3.1 4.5h2.1l1.7 10.2h10.6l2.2-7.4H6.2"
            stroke="#f05b32"
            strokeWidth="1.65"
          />
          <circle cx="9" cy="18.8" r="1.35" fill="#f42269" stroke="none" />
          <circle cx="17" cy="18.8" r="1.35" fill="#ff9f0a" stroke="none" />
        </>
      );
    case 'muster-bank':
      return (
        <>
          <path
            d="m3.2 9.1 8.8-5 8.8 5H3.2Zm1.4 1.9h14.8M5.7 11v6.7M9.9 11v6.7M14.1 11v6.7M18.3 11v6.7M3.6 19.8h16.8"
            stroke="#15966a"
            strokeWidth="1.45"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="7.3" r="1.1" fill="#41c58f" stroke="none" />
        </>
      );
    case 'settings':
      return (
        <>
          <path
            d="M9.5 3.2h5l.55 2.25c.55.23 1.07.53 1.55.9l2.22-.7 2.5 4.35-1.68 1.55a8.5 8.5 0 0 1 0 1.9L21.32 15l-2.5 4.35-2.22-.7c-.48.37-1 .67-1.55.9l-.55 2.25h-5l-.55-2.25a8.3 8.3 0 0 1-1.55-.9l-2.22.7L2.68 15l1.68-1.55a8.5 8.5 0 0 1 0-1.9L2.68 10l2.5-4.35 2.22.7c.48-.37 1-.67 1.55-.9L9.5 3.2Z"
            fill="currentColor"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12.5" r="3.15" stroke="currentColor" strokeWidth="1.55" />
        </>
      );
    case 'campus-workspace':
      return (
        <>
          <rect
            x="3.2"
            y="5"
            width="17.6"
            height="12.2"
            rx="2.2"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <path d="M4.8 6.7h14.4v8.8H4.8zM2.8 18.6h18.4M9.2 18.6l.7-1.4h4.2l.7 1.4" />
          <rect
            x="6.4"
            y="8.2"
            width="4.1"
            height="3.2"
            rx="0.65"
            fill="currentColor"
            fillOpacity="0.32"
            stroke="none"
          />
          <path d="M12.4 8.8h4.4M12.4 11.1h3.1M6.4 13.4h10.4" />
        </>
      );
    case 'campus-services':
      return (
        <>
          <path
            d="M5.2 2.9h9.2l4.4 4.4v13.8H5.2V2.9Z"
            fill="currentColor"
            fillOpacity="0.1"
          />
          <path d="M5.2 2.9h9.2l4.4 4.4v13.8H5.2V2.9ZM14.4 3v4.3h4.3" />
          <circle cx="9" cy="10" r="1.55" fill="currentColor" fillOpacity="0.28" />
          <path d="m8.25 10 .55.6 1.05-1.25M12.2 10h3.5" />
          <circle cx="9" cy="15.5" r="1.55" fill="currentColor" fillOpacity="0.28" />
          <path d="m8.25 15.5.55.6 1.05-1.25M12.2 15.5h3.5" />
          <circle cx="18.7" cy="18.8" r="3" fill="#b98a54" stroke="white" strokeWidth="0.9" />
          <path d="m17.35 18.8.85.85 1.75-1.85" stroke="white" strokeWidth="1.1" />
        </>
      );
    case 'campus-cloud':
      return (
        <>
          <path
            d="M5.5 18.4h12.7a3.6 3.6 0 0 0 .2-7.2 6.2 6.2 0 0 0-11.8-1.6 4.5 4.5 0 0 0-1.1 8.8Z"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <path d="M5.5 18.4h12.7a3.6 3.6 0 0 0 .2-7.2 6.2 6.2 0 0 0-11.8-1.6 4.5 4.5 0 0 0-1.1 8.8Z" />
          <rect x="9.1" y="11.4" width="5.8" height="4.8" rx="1.1" fill="currentColor" fillOpacity="0.28" />
          <path d="M10.5 11.4V10a1.5 1.5 0 0 1 3 0v1.4M12 13.4v1.1" />
          <circle cx="18.6" cy="18.4" r="2.6" fill="white" stroke="currentColor" strokeWidth="1.1" />
          <path d="M17.2 18.4a1.5 1.5 0 0 1 2.5-1.1M19.9 17.1v1.1h-1.1M20 18.5a1.5 1.5 0 0 1-2.5 1.1M17.3 19.8v-1.1h1.1" />
        </>
      );
    case 'notifications':
      return (
        <>
          <path
            d="M5.1 17.2h13.8l-2-2.8v-4.2a4.9 4.9 0 0 0-9.8 0v4.2l-2 2.8Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path d="M5.1 17.2h13.8l-2-2.8v-4.2a4.9 4.9 0 0 0-9.8 0v4.2l-2 2.8ZM10.1 19.2c.5.8 1.1 1.2 1.9 1.2s1.4-.4 1.9-1.2M12 5.3V3.5" />
          <circle cx="18.3" cy="7.1" r="2.9" fill="#b98a54" stroke="white" strokeWidth="0.9" />
          <path d="M18.3 5.7v1.8M18.3 8.5h.01" stroke="white" strokeWidth="1.15" />
        </>
      );
    case 'confirmations':
      return (
        <>
          <path
            d="M11 27.5 32 16l21 11.5V49a7 7 0 0 1-7 7H18a7 7 0 0 1-7-7V27.5Z"
            fill="#d7efeb"
            stroke="#3e9292"
          />
          <rect
            x="18.5"
            y="5"
            width="27"
            height="39"
            rx="3.5"
            fill="#f8fcfb"
            stroke="#3e9292"
          />
          <circle
            cx="32"
            cy="18"
            r="8.5"
            fill="#83cdbd"
            stroke="#3e9292"
          />
          <path d="m27.8 18.1 2.9 3 5.8-6.2" stroke="white" strokeWidth="3.2" />
          <path d="M25 31h14M27.5 36h9" stroke="#78aaa7" strokeWidth="2.6" />
          <path
            d="M11 28 32 47.5 53 28v21a7 7 0 0 1-7 7H18a7 7 0 0 1-7-7V28Z"
            fill="#c9e9e4"
            stroke="#3e9292"
          />
          <path d="m11.8 54.1 14.9-13.8M52.2 54.1 37.3 40.3" stroke="#69aaa5" />
          <circle cx="52" cy="51.5" r="11.5" fill="white" stroke="white" strokeWidth="2" />
          <circle cx="52" cy="51.5" r="9.1" fill="#fff9f1" stroke="#ae7d48" strokeWidth="2.3" />
          <circle cx="52" cy="51.5" r="6.8" stroke="#d4b083" strokeWidth="1.4" />
          <path d="m47.6 51.4 3 3.1 6.1-6.4" stroke="#a77745" strokeWidth="2.8" />
        </>
      );
    case 'reset-links':
      return (
        <>
          <path
            d="M42.5 51A22.5 22.5 0 1 1 50 20"
            stroke="#72bcae"
            strokeWidth="4"
          />
          <path d="M42 19.5h8.5V28" stroke="#72bcae" strokeWidth="4" />
          <rect
            x="14"
            y="31"
            width="26"
            height="11"
            rx="5.5"
            fill="#d9f1ed"
            stroke="#3e9292"
            strokeWidth="3"
            transform="rotate(-45 27 36.5)"
          />
          <path d="m20.7 42.8 12.6-12.6" stroke="#84cabe" strokeWidth="2.2" />
          <rect
            x="25"
            y="20"
            width="26"
            height="11"
            rx="5.5"
            fill="#f5fbfa"
            stroke="white"
            strokeWidth="7"
            transform="rotate(-45 38 25.5)"
          />
          <rect
            x="25"
            y="20"
            width="26"
            height="11"
            rx="5.5"
            fill="#d9f1ed"
            stroke="#3e9292"
            strokeWidth="3"
            transform="rotate(-45 38 25.5)"
          />
          <path d="m31.7 31.8 12.6-12.6" stroke="#84cabe" strokeWidth="2.2" />
          <circle cx="52" cy="51.5" r="11.5" fill="white" stroke="white" strokeWidth="2" />
          <circle cx="52" cy="51.5" r="9.1" fill="#fff9f1" stroke="#ae7d48" strokeWidth="2.3" />
          <path
            d="M57 52.5a5.2 5.2 0 1 1-1.5-4.3M55.7 44.9l-.2 3.3-3.4-.2"
            stroke="#a77745"
            strokeWidth="2.4"
          />
        </>
      );
    case 'compose-message':
      return (
        <>
          <path d="m2.8 10.6 18.4-7.2-5.8 17.2-4.1-6.5-8.5-3.5Z" fill="currentColor" fillOpacity="0.16" />
          <path d="m2.8 10.6 18.4-7.2-5.8 17.2-4.1-6.5-8.5-3.5ZM11.3 14.1l9.9-10.7M11.3 14.1l-.6 4" />
          <circle cx="18.2" cy="17.7" r="3.2" fill="white" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="18.2" cy="16.8" r="0.9" fill="currentColor" fillOpacity="0.45" />
          <path d="M16.6 19.4c.3-1 .8-1.5 1.6-1.5s1.3.5 1.6 1.5" />
        </>
      );
    case 'direct-messages':
      return (
        <>
          <path d="M3.1 4.5h13.2v9H8.4l-4.2 3.3v-3.3H3.1v-9Z" fill="currentColor" fillOpacity="0.12" />
          <path d="M3.1 4.5h13.2v9H8.4l-4.2 3.3v-3.3H3.1v-9ZM7 8.1h5.5M7 10.5h3.5" />
          <path d="M9.2 16h6.4l4.2 3.3V16h1.1V8.2h-2.1" />
          <circle cx="17.8" cy="8" r="2.8" fill="white" stroke="currentColor" strokeWidth="1.05" />
          <rect x="16.65" y="7.65" width="2.3" height="1.75" rx="0.45" fill="currentColor" fillOpacity="0.28" />
          <path d="M17.15 7.65v-.7a.65.65 0 0 1 1.3 0v.7" />
        </>
      );
    case 'groups-contacts':
      return (
        <>
          <circle cx="12" cy="9" r="3" fill="currentColor" fillOpacity="0.2" />
          <circle cx="5.4" cy="10.5" r="2.1" fill="currentColor" fillOpacity="0.12" />
          <circle cx="18.6" cy="10.5" r="2.1" fill="currentColor" fillOpacity="0.12" />
          <path d="M7.4 19.8c.5-3.9 2-5.8 4.6-5.8s4.1 1.9 4.6 5.8H7.4ZM1.8 18.4c.4-2.8 1.6-4.2 3.6-4.2 1 0 1.9.4 2.5 1.1M22.2 18.4c-.4-2.8-1.6-4.2-3.6-4.2-1 0-1.9.4-2.5 1.1" />
          <path d="M4.8 5.7A8.8 8.8 0 0 1 12 2.4a8.8 8.8 0 0 1 7.2 3.3" strokeDasharray="1.2 2.2" />
          <circle cx="12" cy="2.4" r="1" fill="#b98a54" stroke="none" />
        </>
      );
    case 'posts-reactions':
      return (
        <>
          <rect x="3.3" y="3.3" width="15.8" height="17.4" rx="2.1" fill="currentColor" fillOpacity="0.1" />
          <path d="M3.3 3.3h15.8v17.4H3.3V3.3Z" />
          <circle cx="7" cy="7.1" r="1.4" fill="currentColor" fillOpacity="0.3" />
          <path d="M9.6 6.2h6M9.6 8.1h4M5.5 17l3.7-4 2.5 2.5 2.1-2.2 3 3.7" />
          <circle cx="18.3" cy="18.2" r="3.2" fill="#b98a54" stroke="white" strokeWidth="0.9" />
          <path d="M18.3 19.7 16.8 18c-1.4-1.6.8-3 1.5-1.7.7-1.3 2.9.1 1.5 1.7l-1.5 1.7Z" fill="white" stroke="none" />
        </>
      );
    case 'shield':
      return <path d="M12 3 19 6v5c0 4.2-2.8 7.7-7 10-4.2-2.3-7-5.8-7-10V6l7-3Zm-3 9 2 2 4-4" />;
    case 'structure':
      return <path d="M6 7h12M6 12h12M6 17h12M8 5v14M16 5v14" />;
    case 'hypothetical':
      return <path d="M12 3 21 20H3L12 3Zm0 6v5M12 17h.01" />;
    case 'service':
      return <path d="M5 5h6v6H5V5Zm8 0h6v6h-6V5ZM5 13h6v6H5v-6Zm8 0h6v6h-6v-6Z" />;
    case 'function':
      return (
        <path d="M8 4h8l1 3 2 1-2 3v2l2 3-2 1-1 3H8l-1-3-2-1 2-3v-2L5 8l2-1 1-3Zm4 5v6M9 12h6" />
      );
    case 'content':
      return <path d="M6 3h9l4 4v14H6V3Zm8 1v4h4M9 12h6M9 16h6" />;
    case 'annotation':
      return <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 7v6M12 7h.01" />;
    case 's09-account-swatch':
    case 's09-account-swatch-removing':
      return null;
    default:
      return (
        <>
          <circle cx="12" cy="8.5" r="3" />
          <path d="M5.5 20c.8-4 2.9-6 6.5-6s5.7 2 6.5 6" />
        </>
      );
  }
}

export function NetworkSymbol({ symbolId, className }: NetworkSymbolProps) {
  const usesConceptEmailArtwork = conceptEmailSymbolIds.has(symbolId);
  const strokeWidth = usesConceptEmailArtwork ? 2.2 : detailSymbolIds.has(symbolId) ? 1.35 : 1.8;

  return (
    <svg
      aria-hidden="true"
      className={className ?? ''}
      data-network-symbol={symbolId}
      viewBox={usesConceptEmailArtwork ? '0 0 64 64' : '0 0 24 24'}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <SymbolPaths symbolId={symbolId} />
    </svg>
  );
}

export function NetworkStatusMarker({
  status,
  locked = false,
  className,
}: {
  readonly status: SceneNodeStatus;
  readonly locked?: boolean;
  readonly className: string | undefined;
}) {
  const marker =
    locked
      ? 'locked'
      : status === 'viewed' || status === 'understood'
      ? 'viewed'
      : status === 'protected'
        ? 'protected'
        : status === 'affected' || status === 'exposed'
          ? 'affected'
          : status === 'hypothetical'
            ? 'hypothetical'
            : 'open';

  return (
    <svg
      aria-hidden="true"
      className={className}
      data-network-status-marker={marker}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {marker === 'locked' ? (
        <>
          <path
            data-lock-shackle
            d="M8.2 10V7.4a3.8 3.8 0 0 1 7.6 0V10"
            strokeWidth="2.8"
          />
          <rect data-lock-body x="4.8" y="9.5" width="14.4" height="10.2" rx="2.2" />
          <path data-lock-keyhole d="M12 13v3.2" strokeWidth="2.8" />
        </>
      ) : null}
      {marker === 'viewed' ? <path d="m5 12 4.2 4.2L19 6.7" /> : null}
      {marker === 'protected' ? (
        <path d="M12 3 19 6v5c0 4.2-2.8 7.7-7 10-4.2-2.3-7-5.8-7-10V6l7-3Zm-3 9 2 2 4-4" />
      ) : null}
      {marker === 'affected' ? <path d="M12 4 21 20H3L12 4Zm0 6v4M12 17h.01" /> : null}
      {marker === 'hypothetical' ? <path d="M12 3 21 12 12 21 3 12 12 3Z" /> : null}
      {marker === 'open' ? <circle cx="12" cy="12" r="6.5" /> : null}
    </svg>
  );
}
