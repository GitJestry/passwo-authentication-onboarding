import { s01Content, type S01AccountId } from '@passwo/training-content';
import type { ReactNode } from 'react';
import { NetworkSymbol } from '../../adapters/network/NetworkSymbolRegistry.js';
import styles from './CampusWebsiteBackdrop.module.css';

export interface CampusWebsiteBackdropProps {
  readonly accountId: S01AccountId;
  readonly children: ReactNode;
  readonly interactionLabel: string;
  readonly layout?: 'default' | 'authentication';
}

function SkeletonLines({ count = 3 }: { readonly count?: number }) {
  return (
    <span className={styles.skeletonLines} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}

function CampusIdContext() {
  return (
    <section className={styles.portalContext} aria-label="CampusID-Übersicht">
      <div className={styles.portalWelcome}>
        <NetworkSymbol symbolId="campus-id" className={styles.contextHeroSymbol} />
        <div>
          <h2>Campusübersicht</h2>
          <SkeletonLines count={2} />
        </div>
      </div>
      <div className={styles.portalGrid} aria-hidden="true">
        {['service', 'exam-portal', 'cloud-notes', 'annotation'].map((symbolId) => (
          <div className={styles.portalTile} key={symbolId}>
            <NetworkSymbol symbolId={symbolId} className={styles.contextSymbol} />
            <SkeletonLines count={2} />
          </div>
        ))}
      </div>
    </section>
  );
}

function CampusMailContext() {
  return (
    <section className={styles.mailContext} aria-label="CampusMail-Postfachansicht">
      <aside className={styles.mailFolders} aria-hidden="true">
        <NetworkSymbol symbolId="campus-mail" className={styles.contextHeroSymbol} />
        <span className={styles.folderActive} />
        <span />
        <span />
        <span />
      </aside>
      <div className={styles.mailList} aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div className={styles.mailRow} key={index}>
            <span className={styles.avatar} />
            <SkeletonLines count={2} />
            <span className={styles.mailTime} />
          </div>
        ))}
      </div>
      <div className={styles.mailReadingPane} aria-hidden="true">
        <SkeletonLines count={5} />
      </div>
    </section>
  );
}

function CampusBoardContext() {
  return (
    <section className={styles.boardContext} aria-label="CampusBoard-Archivansicht">
      <div className={styles.boardToolbar} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.boardFeed} aria-hidden="true">
        {['announcements', 'project-questions', 'archived-discussions'].map((symbolId) => (
          <article className={styles.boardPost} key={symbolId}>
            <NetworkSymbol symbolId={symbolId} className={styles.contextSymbol} />
            <div>
              <SkeletonLines count={3} />
              <span className={styles.boardMeta} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AccountContext({ accountId }: { readonly accountId: S01AccountId }) {
  if (accountId === 'campus-mail') return <CampusMailContext />;
  if (accountId === 'campus-board-archive') return <CampusBoardContext />;
  return <CampusIdContext />;
}

export function CampusWebsiteBackdrop({
  accountId,
  children,
  interactionLabel,
  layout = 'default',
}: CampusWebsiteBackdropProps) {
  const account = s01Content.browser.accounts.find(({ id }) => id === accountId);
  if (account === undefined) return null;

  return (
    <article className={styles.page} data-campus-site={account.id} data-layout={layout}>
      <header className={styles.pageHeader}>
        <div className={styles.siteIdentity}>
          <NetworkSymbol symbolId={account.symbolId} className={styles.siteSymbol} />
          <span className={styles.identityName}>{account.label}</span>
        </div>
        <nav className={styles.siteNavigation} aria-label={`${account.label}-Navigation`}>
          {account.navigation.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </nav>
      </header>
      <div className={styles.pageBody}>
        <section className={styles.interactionColumn} aria-label={interactionLabel}>
          {children}
        </section>
        {layout === 'default' ? <AccountContext accountId={account.id} /> : null}
      </div>
    </article>
  );
}
