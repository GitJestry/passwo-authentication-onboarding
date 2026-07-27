import type { SceneNode, SceneNodeStatus } from '@passwo/visualization';

interface NetworkSymbolProps {
  readonly symbolId: string;
  readonly className: string | undefined;
}

const symbolIdByNodeId: Readonly<Record<string, string>> = {
  'campus-id': 'campus-id',
  'campus-mail': 'campus-mail',
  'campus-board': 'campus-board-archive',
  'campus-board-archive': 'campus-board-archive',
};

export function resolveNetworkSymbolId(node: Pick<SceneNode, 'id' | 'kind' | 'symbolId'>): string {
  return node.symbolId ?? symbolIdByNodeId[node.id] ?? node.kind;
}

function SymbolPaths({ symbolId }: Pick<NetworkSymbolProps, 'symbolId'>) {
  switch (symbolId) {
    case 'campus-id':
      return (
        <>
          <rect x="4" y="3" width="16" height="18" rx="3" />
          <circle cx="12" cy="9" r="2.25" />
          <path d="M8 17c.8-2.2 2.1-3.3 4-3.3s3.2 1.1 4 3.3" />
        </>
      );
    case 'campus-mail':
      return (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </>
      );
    case 'campus-board-archive':
      return (
        <>
          <path d="M4 8h16v12H4z" />
          <path d="M7 8V5h10v3M9 13h6M12 11v4" />
        </>
      );
    case 'learnspace':
      return (
        <>
          <path d="M4 6.5c3-1.5 5.7-1.2 8 1v10c-2.3-2.2-5-2.5-8-1V6.5Z" />
          <path d="M20 6.5c-3-1.5-5.7-1.2-8 1v10c2.3-2.2 5-2.5 8-1V6.5Z" />
        </>
      );
    case 'exam-portal':
      return (
        <>
          <rect x="6" y="4" width="12" height="17" rx="2" />
          <path d="M9 4.5h6v3H9zM9 12l1.5 1.5 3-3M9 17h6" />
        </>
      );
    case 'cloud-notes':
      return (
        <>
          <path d="M7.2 18.5H18a3.2 3.2 0 1 0-.9-6.2A5.3 5.3 0 0 0 7 10.3a4.1 4.1 0 0 0 .2 8.2Z" />
          <path d="M10 6h5v7h-5zM11.5 9h2" />
        </>
      );
    case 'notifications':
      return (
        <>
          <path d="M6.5 16.5h11l-1.6-2.2v-4.1a3.9 3.9 0 0 0-7.8 0v4.1l-1.6 2.2Z" />
          <path d="M10 19h4" />
        </>
      );
    case 'confirmations':
      return (
        <>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="m8.5 12 2.2 2.2 4.8-5M9 7h6" />
        </>
      );
    case 'reset-links':
      return (
        <>
          <circle cx="8.5" cy="12" r="3.5" />
          <path d="m11 14.5 7-7M15.5 7.5H18V10M15 16.5a6.5 6.5 0 0 1-8.7.2" />
        </>
      );
    case 'compose-message':
      return (
        <>
          <path d="M5 5h14v10H9l-4 4V5Z" />
          <path d="m11 12 5-5 1.4 1.4-5 5L10 14Z" />
        </>
      );
    case 'announcements':
      return <path d="m5 12 10-5v10L5 12ZM15 9.5h3.5M15 14.5h3.5M7 13v4" />;
    case 'project-questions':
      return (
        <>
          <path d="M4 5h12v9H9l-4 3V5ZM10 8.5a1.7 1.7 0 1 1 2.8 1.3c-.8.7-1.3 1-1.3 2M11.5 13h.01" />
          <path d="M18 9h2v8l-3-2h-5" />
        </>
      );
    case 'archived-discussions':
      return (
        <>
          <path d="M4 5h16v14H8l-4 2V5Z" />
          <path d="M8 10h8M8 14h5" />
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
  return (
    <svg
      aria-hidden="true"
      className={className}
      data-network-symbol={symbolId}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
      : status === 'understood'
      ? 'understood'
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
          <rect x="5.5" y="10" width="13" height="9" rx="1.5" />
          <path d="M8.5 10V7.7a3.5 3.5 0 0 1 7 0V10" />
        </>
      ) : null}
      {marker === 'understood' ? <path d="m5 12 4.2 4.2L19 6.7" /> : null}
      {marker === 'protected' ? (
        <path d="M12 3 19 6v5c0 4.2-2.8 7.7-7 10-4.2-2.3-7-5.8-7-10V6l7-3Zm-3 9 2 2 4-4" />
      ) : null}
      {marker === 'affected' ? <path d="M12 4 21 20H3L12 4Zm0 6v4M12 17h.01" /> : null}
      {marker === 'hypothetical' ? <path d="M12 3 21 12 12 21 3 12 12 3Z" /> : null}
      {marker === 'open' ? <circle cx="12" cy="12" r="6.5" /> : null}
    </svg>
  );
}
