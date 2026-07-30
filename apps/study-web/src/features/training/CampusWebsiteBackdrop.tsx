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

type CampusAccount = (typeof s01Content.browser.accounts)[number];

function CampusIdContext({ account }: { readonly account: CampusAccount }) {
  const tiles = [
    { symbolId: 'service', label: account.navigation[0] ?? account.overview.title },
    { symbolId: 'exam-portal', label: account.navigation[1] ?? account.overview.activityTitle },
    { symbolId: 'cloud-notes', label: account.overview.activityItems[0] ?? account.overview.title },
    {
      symbolId: 'annotation',
      label: account.overview.activityItems[1] ?? account.overview.activityTitle,
    },
  ] as const;

  return (
    <section className={styles.portalContext} aria-label="Master-Campus-Übersicht">
      <div className={styles.portalWelcome}>
        <NetworkSymbol symbolId="campus-id" className={styles.contextHeroSymbol} />
        <div>
          <span className={styles.eyebrow}>{account.role}</span>
          <h2>{account.overview.title}</h2>
          <p>{account.overview.description}</p>
        </div>
      </div>
      <div className={styles.portalGrid}>
        {tiles.map((tile, index) => (
          <article className={styles.portalTile} key={tile.symbolId}>
            <NetworkSymbol symbolId={tile.symbolId} className={styles.contextSymbol} />
            <div>
              <strong>{tile.label}</strong>
              <span>
                {index < 2 ? account.overview.description : account.overview.activityTitle}
              </span>
            </div>
            <span className={styles.tileArrow} aria-hidden="true">
              →
            </span>
          </article>
        ))}
      </div>
      <section className={styles.activityPanel}>
        <span className={styles.eyebrow}>{account.overview.activityTitle}</span>
        {account.overview.activityItems.map((item) => (
          <div className={styles.activityRow} key={item}>
            <span className={styles.activityDot} aria-hidden="true" />
            <span>{item}</span>
            <span aria-hidden="true">•••</span>
          </div>
        ))}
      </section>
    </section>
  );
}

function CampusMailContext({ account }: { readonly account: CampusAccount }) {
  return (
    <section className={styles.mailContext} aria-label="Campus-E-Mail-Postfachansicht">
      <aside className={styles.mailFolders}>
        <NetworkSymbol symbolId="campus-mail" className={styles.contextHeroSymbol} />
        {account.navigation.map((item, index) => (
          <span className={index === 0 ? styles.folderActive : undefined} key={item}>
            {item}
          </span>
        ))}
      </aside>
      <div className={styles.mailList}>
        <header className={styles.mailListHeader}>
          <span className={styles.eyebrow}>{account.overview.activityTitle}</span>
          <strong>{account.overview.title}</strong>
        </header>
        {[...account.overview.activityItems, ...account.navigation].map((item, index) => (
          <div className={styles.mailRow} key={`${item}-${index}`}>
            <span className={styles.avatar}>{index + 1}</span>
            <span className={styles.mailSummary}>
              <strong>{item}</strong>
              <span>{account.overview.description}</span>
            </span>
            <span className={styles.mailTime}>{index + 8}:0{index}</span>
          </div>
        ))}
      </div>
      <div className={styles.mailReadingPane}>
        <span className={styles.eyebrow}>{account.role}</span>
        <h2>{account.overview.activityItems[0]}</h2>
        <p>{account.overview.description}</p>
        <div className={styles.readingRule} aria-hidden="true" />
        <p>{account.overview.activityItems[1]}</p>
        <div className={styles.readingPreview} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}

function CampusBoardContext({ account }: { readonly account: CampusAccount }) {
  return (
    <section className={styles.boardContext} aria-label="Campusgram-Ansicht">
      <div className={styles.boardToolbar}>
        {account.navigation.map((item, index) => (
          <span className={index === 0 ? styles.boardToolbarActive : undefined} key={item}>
            {item}
          </span>
        ))}
      </div>
      <div className={styles.boardIntro}>
        <span className={styles.eyebrow}>{account.role}</span>
        <h2>{account.overview.title}</h2>
        <p>{account.overview.description}</p>
      </div>
      <div className={styles.boardFeed}>
        {['announcements', 'project-questions', 'archived-discussions'].map((symbolId, index) => (
          <article className={styles.boardPost} key={symbolId}>
            <NetworkSymbol symbolId={symbolId} className={styles.contextSymbol} />
            <div>
              <strong>
                {account.overview.activityItems[
                  index % account.overview.activityItems.length
                ] ?? account.overview.activityTitle}
              </strong>
              <p>{account.overview.description}</p>
              <span className={styles.boardMeta}>{account.navigation[index]}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AccountContext({ account }: { readonly account: CampusAccount }) {
  if (account.id === 'campus-mail') return <CampusMailContext account={account} />;
  if (account.id === 'campus-board-archive') return <CampusBoardContext account={account} />;
  return <CampusIdContext account={account} />;
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
        {layout === 'default' ? <AccountContext account={account} /> : null}
      </div>
    </article>
  );
}
