import { s01Content, type S01AccountId } from '@passwo/training-content';
import type { ReactNode, Ref } from 'react';
import campusgramHero from '../../assets/campus-sites/campusgram-hero.webp';
import campusEmailHero from '../../assets/campus-sites/campus-mail-hero.webp';
import masterCampusHero from '../../assets/campus-sites/master-campus-hero.webp';
import { NetworkSymbol } from '../../adapters/network/NetworkSymbolRegistry.js';
import styles from './CampusWebsiteBackdrop.module.css';

export type CampusWebsiteView = 'landing' | 'authentication' | 'dashboard';

export interface CampusWebsiteAction {
  readonly label: string;
  readonly onClick?: (() => void) | undefined;
  readonly disabled?: boolean | undefined;
  readonly disabledReason?: string | undefined;
}

export interface CampusWebsiteBackdropProps {
  readonly accountId: S01AccountId;
  readonly interactionLabel: string;
  readonly view: CampusWebsiteView;
  readonly children?: ReactNode | undefined;
  readonly displayName?: string | undefined;
  readonly primaryAction?: CampusWebsiteAction | undefined;
  readonly secondaryAction?: CampusWebsiteAction | undefined;
  readonly authenticationTitle?: string | undefined;
  readonly onBack?: (() => void) | undefined;
  readonly dashboardHeadingRef?: Ref<HTMLHeadingElement> | undefined;
  readonly dashboardNotice?: ReactNode | undefined;
  readonly rootRef?: Ref<HTMLElement> | undefined;
  readonly timeLapseActive?: boolean | undefined;
}

type CampusAccount = (typeof s01Content.browser.accounts)[number];

type CampusWebsiteKind = S01AccountId;

interface CampusWebsiteDefinition {
  readonly account: CampusAccount;
  readonly heroImage: string;
  readonly heroHeight: number;
  readonly heroWidth: number;
  readonly kind: CampusWebsiteKind;
}

function campusAccount(accountId: S01AccountId): CampusAccount {
  const account = s01Content.browser.accounts.find(({ id }) => id === accountId);
  if (account === undefined) throw new Error(`missing-campus-account:${accountId}`);
  return account;
}

function campusWebsiteDefinition(accountId: S01AccountId): CampusWebsiteDefinition {
  switch (accountId) {
    case 'master-campus':
      return {
        account: campusAccount(accountId),
        heroImage: masterCampusHero,
        heroHeight: 747,
        heroWidth: 1400,
        kind: accountId,
      };
    case 'campus-email':
      return {
        account: campusAccount(accountId),
        heroImage: campusEmailHero,
        heroHeight: 747,
        heroWidth: 1400,
        kind: accountId,
      };
    case 'campusgram':
      return {
        account: campusAccount(accountId),
        heroImage: campusgramHero,
        heroHeight: 933,
        heroWidth: 1400,
        kind: accountId,
      };
    default: {
      const exhaustiveAccountId: never = accountId;
      throw new Error(`unknown-campus-account:${String(exhaustiveAccountId)}`);
    }
  }
}

function SiteVisual({ definition }: { readonly definition: CampusWebsiteDefinition }) {
  return (
    <figure className={styles.heroVisual}>
      <img
        src={definition.heroImage}
        width={definition.heroWidth}
        height={definition.heroHeight}
        loading="eager"
        alt=""
      />
    </figure>
  );
}

function SiteHeader({
  account,
  view,
}: {
  readonly account: CampusAccount;
  readonly view: CampusWebsiteView;
}) {
  const navigation =
    view === 'authentication' ? account.authenticationNavigation : account.landingNavigation;
  return (
    <header className={styles.pageHeader}>
      <div className={styles.siteIdentity}>
        <NetworkSymbol symbolId={account.symbolId} className={styles.siteSymbol} />
        <span className={styles.identityName}>{account.label}</span>
      </div>
      <nav className={styles.siteNavigation} aria-label={`${account.label}-Navigation`}>
        {navigation.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </nav>
      <span className={styles.language}>{s01Content.siteUi.language}</span>
    </header>
  );
}

function ActionButton({
  action,
  variant,
  accountId,
}: {
  readonly action: CampusWebsiteAction;
  readonly variant: 'primary' | 'secondary';
  readonly accountId: S01AccountId;
}) {
  const disabled = action.disabled === true;
  const reasonId = `${accountId}-${variant}-action-reason`;
  return (
    <>
      <button
        type="button"
        className={variant === 'primary' ? styles.primaryAction : styles.secondaryAction}
        aria-disabled={disabled || undefined}
        aria-describedby={disabled && action.disabledReason !== undefined ? reasonId : undefined}
        title={disabled ? action.disabledReason : undefined}
        onClick={disabled ? undefined : action.onClick}
      >
        {action.label}
      </button>
      {disabled && action.disabledReason !== undefined ? (
        <span id={reasonId} className={styles.screenReaderOnly}>
          {action.disabledReason}
        </span>
      ) : null}
    </>
  );
}

function LandingView({
  definition,
  primaryAction,
  secondaryAction,
}: {
  readonly definition: CampusWebsiteDefinition;
  readonly primaryAction?: CampusWebsiteAction | undefined;
  readonly secondaryAction?: CampusWebsiteAction | undefined;
}) {
  const { account } = definition;
  return (
    <main className={styles.landing}>
      <section className={styles.landingHero}>
        <div className={styles.heroCopy}>
          <h1>{account.landing.headline}</h1>
          <p className={styles.heroDescription}>{account.landing.description}</p>
          <ul className={styles.benefitList}>
            {account.landing.benefits.map((benefit) => (
              <li key={benefit}>
                <span aria-hidden="true">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
          {primaryAction === undefined && secondaryAction === undefined ? null : (
            <div className={styles.heroActions}>
              {primaryAction === undefined ? null : (
                <ActionButton action={primaryAction} variant="primary" accountId={account.id} />
              )}
              {secondaryAction === undefined ? null : (
                <ActionButton action={secondaryAction} variant="secondary" accountId={account.id} />
              )}
            </div>
          )}
        </div>
        <SiteVisual definition={definition} />
      </section>

    </main>
  );
}

function DashboardHeading({
  account,
  displayName,
  dashboardHeadingRef,
}: {
  readonly account: CampusAccount;
  readonly displayName?: string | undefined;
  readonly dashboardHeadingRef?: Ref<HTMLHeadingElement> | undefined;
}) {
  const greetingName = displayName?.trim().split(/\s+/u)[0] || 'Campus';
  return (
    <header className={styles.dashboardWelcome}>
      <div>
        <h1 ref={dashboardHeadingRef} tabIndex={dashboardHeadingRef === undefined ? undefined : -1}>
          {s01Content.siteUi.greeting(greetingName)}
        </h1>
        <p>{account.overview.description}</p>
      </div>
    </header>
  );
}

function SidebarNavigationIconFrame({ children }: { readonly children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={styles.sidebarNavigationIcon}
      fill="none"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

function DashboardNavigationIcon({ index }: { readonly index: number }) {
  switch (index) {
    case 0:
      return (
        <SidebarNavigationIconFrame>
          <path d="m3.8 10.8 8.2-7 8.2 7v8.4H14.8v-5.4H9.2v5.4H3.8z" />
        </SidebarNavigationIconFrame>
      );
    case 1:
      return (
        <SidebarNavigationIconFrame>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.4" />
          <path d="M3.8 19c.35-3.6 2.1-5.5 5.2-5.5s4.85 1.9 5.2 5.5M14.2 14.2c3.5-.7 5.45.9 5.9 3.8" />
        </SidebarNavigationIconFrame>
      );
    case 2:
      return (
        <SidebarNavigationIconFrame>
          <path d="M4 5.5h16v11H9l-4.5 3v-3H4z" />
          <path d="M8 9.2h8M8 12.6h5" />
        </SidebarNavigationIconFrame>
      );
    default:
      return (
        <SidebarNavigationIconFrame>
          <rect x="4" y="5.5" width="16" height="14" rx="2" />
          <path d="M8 3.5v4M16 3.5v4M4 9.5h16M8 13h3M14 13h2M8 16h2" />
        </SidebarNavigationIconFrame>
      );
  }
}

function MasterNavigationIcon({ index }: { readonly index: number }) {
  switch (index) {
    case 0:
      return (
        <SidebarNavigationIconFrame>
          <path d="m3.8 10.8 8.2-7 8.2 7v8.4H14.8v-5.4H9.2v5.4H3.8z" />
        </SidebarNavigationIconFrame>
      );
    case 1:
      return (
        <SidebarNavigationIconFrame>
          <circle cx="8.2" cy="8.2" r="2.8" />
          <circle cx="16.4" cy="8.8" r="2.3" />
          <path d="M3.5 19c.3-3.5 1.9-5.2 4.8-5.2 2.8 0 4.5 1.7 4.8 5.2M13.6 14.2c3.6-.8 5.8.8 6.2 4" />
        </SidebarNavigationIconFrame>
      );
    case 2:
      return (
        <SidebarNavigationIconFrame>
          <rect x="4" y="5.5" width="16" height="14" rx="2" />
          <path d="M8 3.5v4M16 3.5v4M4 9.5h16M8 13h3M14 13h2M8 16h2" />
        </SidebarNavigationIconFrame>
      );
    case 3:
      return (
        <SidebarNavigationIconFrame>
          <path d="M6.2 18.5h11.3a3.3 3.3 0 0 0 .3-6.6A5.7 5.7 0 0 0 7 10.5a4.1 4.1 0 0 0-.8 8Z" />
        </SidebarNavigationIconFrame>
      );
    case 4:
      return (
        <SidebarNavigationIconFrame>
          <path d="M12 3.5 19 6v5.5c0 4.1-2.3 7.1-7 9-4.7-1.9-7-4.9-7-9V6z" />
          <path d="m9.2 12 1.8 1.8 3.9-4" />
        </SidebarNavigationIconFrame>
      );
    default:
      return (
        <SidebarNavigationIconFrame>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.2 20c.4-4.3 2.7-6.5 6.8-6.5s6.4 2.2 6.8 6.5" />
        </SidebarNavigationIconFrame>
      );
  }
}

function MailNavigationIcon({ index }: { readonly index: number }) {
  switch (index) {
    case 0:
      return (
        <SidebarNavigationIconFrame>
          <path d="M4 7.2h16v11.3H4zM4.8 8l7.2 5.4L19.2 8" />
        </SidebarNavigationIconFrame>
      );
    case 1:
      return (
        <SidebarNavigationIconFrame>
          <path d="m12 3.7 2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.7-5 2.7.9-5.6-4-3.9 5.6-.8z" />
        </SidebarNavigationIconFrame>
      );
    case 2:
      return (
        <SidebarNavigationIconFrame>
          <path d="m4 11.5 16-7-6.3 15.2-2.8-6.6zM10.9 13.1 20 4.5" />
        </SidebarNavigationIconFrame>
      );
    case 3:
      return (
        <SidebarNavigationIconFrame>
          <path d="M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6M9 15.5h6" />
        </SidebarNavigationIconFrame>
      );
    case 4:
      return (
        <SidebarNavigationIconFrame>
          <path d="M4.5 7h15v13h-15zM3.5 4h17v3h-17zM9 11h6" />
        </SidebarNavigationIconFrame>
      );
    default:
      return (
        <SidebarNavigationIconFrame>
          <path d="M5.5 7h13M9 7V4.5h6V7M7 7l.8 13h8.4L17 7M10 10.5v6M14 10.5v6" />
        </SidebarNavigationIconFrame>
      );
  }
}

function DashboardSidebar({
  definition,
  showNavigationIcons = false,
}: {
  readonly definition: CampusWebsiteDefinition;
  readonly showNavigationIcons?: boolean | undefined;
}) {
  const { account, kind } = definition;
  const storageCard = account.dashboard.lowerCards.find(({ title }) => title === 'Speicherplatz');
  return (
    <aside className={styles.dashboardSidebar} aria-label={`${account.label}-Bereiche`}>
      {kind === 'campus-email' ? (
        <span className={styles.sidebarCompose}>＋ {s01Content.siteUi.mailbox.composeLabel}</span>
      ) : (
        <div className={styles.sidebarIdentity}>
          <NetworkSymbol symbolId={account.symbolId} />
          <strong>{account.label}</strong>
        </div>
      )}
      <nav>
        {account.dashboard.navigation.map((item, index) => (
          <span className={index === 0 ? styles.sidebarActive : undefined} key={item}>
            {showNavigationIcons && kind === 'campusgram' ? (
              <DashboardNavigationIcon index={index} />
            ) : showNavigationIcons && kind === 'master-campus' ? (
              <MasterNavigationIcon index={index} />
            ) : showNavigationIcons && kind === 'campus-email' ? (
              <MailNavigationIcon index={index} />
            ) : (
              <i aria-hidden="true" />
            )}
            {item}
          </span>
        ))}
      </nav>
      {kind === 'campus-email' && storageCard !== undefined ? (
        <div className={styles.sidebarStorage}>
          <strong>{storageCard.title}</strong>
          <span>{storageCard.detail}</span>
          <i aria-hidden="true" />
        </div>
      ) : null}
    </aside>
  );
}

function masterServiceSymbolId(title: string): string | undefined {
  switch (title) {
    case 'Campus Workspace':
      return 'campus-workspace';
    case 'Campus Services':
      return 'campus-services';
    case 'Campus Cloud':
      return 'campus-cloud';
    default:
      return undefined;
  }
}

function MasterUtilityBar() {
  return (
    <div className={styles.masterUtilityBar} aria-hidden="true">
      <span className={styles.masterSearchControl}>
        <svg fill="none" viewBox="0 0 24 24">
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="m15 15 4.5 4.5" />
        </svg>
        <i />
      </span>
      <span className={styles.masterUtilityIcon}>
        <svg fill="none" viewBox="0 0 24 24">
          <path d="M6 17.5h12l-1.7-2.4v-4.2a4.3 4.3 0 0 0-8.6 0v4.2zM10 19.5c.5.7 1.2 1 2 1s1.5-.3 2-1" />
        </svg>
      </span>
      <span className={styles.masterAvatar}>P</span>
    </div>
  );
}

function MasterStatusIcon({ index }: { readonly index: number }) {
  return (
    <span className={styles.statusRing} aria-hidden="true">
      {index === 2 ? (
        <svg fill="none" viewBox="0 0 24 24">
          <path d="M5 13v-1a7 7 0 0 1 14 0v1M5 12.5H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v-6ZM19 12.5h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v-6ZM18 18.5c-.8 1.3-2.2 2-4.2 2" />
        </svg>
      ) : (
        <svg fill="none" viewBox="0 0 24 24">
          <path d="m6.5 12.3 3.4 3.4 7.7-8.2" />
        </svg>
      )}
    </span>
  );
}

function MailStatusIcon({ index }: { readonly index: number }) {
  return (
    <span className={styles.mailStatusIcon} aria-hidden="true">
      <svg fill="none" viewBox="0 0 24 24">
        {index === 0 ? (
          <>
            <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
            <path d="m4.5 7 7.5 5.8L19.5 7" />
          </>
        ) : index === 1 ? (
          <>
            <rect x="4" y="4" width="6" height="6" rx="1" />
            <rect x="14" y="4" width="6" height="6" rx="1" />
            <rect x="4" y="14" width="6" height="6" rx="1" />
            <rect x="14" y="14" width="6" height="6" rx="1" />
          </>
        ) : (
          <>
            <path d="M12 3.5 19 6v5.5c0 4.1-2.3 7.1-7 9-4.7-1.9-7-4.9-7-9V6z" />
            <path d="m9.2 12 1.8 1.8 3.9-4" />
          </>
        )}
      </svg>
    </span>
  );
}

function MasterDashboard(props: {
  readonly definition: CampusWebsiteDefinition;
  readonly displayName?: string | undefined;
  readonly dashboardHeadingRef?: Ref<HTMLHeadingElement> | undefined;
}) {
  const { account } = props.definition;
  return (
    <main className={styles.dashboard} data-master-refined="true">
      <DashboardSidebar definition={props.definition} showNavigationIcons />
      <div className={styles.dashboardContent}>
        <div className={styles.masterHeadingRow}>
          <DashboardHeading
            account={account}
            displayName={props.displayName}
            dashboardHeadingRef={props.dashboardHeadingRef}
          />
          <MasterUtilityBar />
        </div>
        <section className={styles.masterSummary} aria-label={s01Content.siteUi.summaryAriaLabel}>
          {account.dashboard.summaryCards.map((card) => {
            const symbolId = masterServiceSymbolId(card.title);
            return (
              <article className={styles.hubCard} key={card.title}>
                {symbolId === undefined ? null : (
                  <span className={styles.hubCardSymbol} aria-hidden="true">
                    <NetworkSymbol symbolId={symbolId} />
                  </span>
                )}
                <div className={styles.hubCardCopy}>
                  <h2>{card.title}</h2>
                  <p>{card.detail}</p>
                  <span className={styles.cardLink}>{s01Content.siteUi.viewLabel} →</span>
                </div>
              </article>
            );
          })}
        </section>
        <section className={styles.masterActivity}>
          <header>
            <h2>{account.dashboard.activityTitle}</h2>
            <span>{s01Content.siteUi.showAllLabel}</span>
          </header>
          {account.dashboard.activities.map((activity) => {
            const symbolId = masterServiceSymbolId(activity.title);
            return (
              <article key={activity.title}>
                {symbolId === undefined ? null : (
                  <span className={styles.activitySymbol} aria-hidden="true">
                    <NetworkSymbol symbolId={symbolId} />
                  </span>
                )}
                <div>
                  <strong>{activity.title}</strong>
                  <span>{activity.meta}</span>
                </div>
                <span aria-hidden="true">›</span>
              </article>
            );
          })}
        </section>
        <section className={styles.masterLower} aria-label={s01Content.siteUi.lowerAriaLabel}>
          {account.dashboard.lowerCards.slice(0, 3).map((card, index) => (
            <article data-card-index={index} key={card.title}>
              <MasterStatusIcon index={index} />
              <div>
                <h2>{card.title}</h2>
                <p>{card.detail}</p>
              </div>
              <span className={styles.cardLink}>{s01Content.siteUi.moreLabel} →</span>
            </article>
          ))}
        </section>
        {account.dashboard.lowerCards[3] === undefined ? null : (
          <section className={styles.masterNotices}>
            <header>
              <h2>{account.dashboard.lowerCards[3].title}</h2>
              <span>{s01Content.siteUi.showAllLabel}</span>
            </header>
            <p>{account.dashboard.lowerCards[3].detail}</p>
          </section>
        )}
      </div>
    </main>
  );
}

function MailDashboard(props: {
  readonly definition: CampusWebsiteDefinition;
  readonly displayName?: string | undefined;
  readonly dashboardHeadingRef?: Ref<HTMLHeadingElement> | undefined;
}) {
  const { account } = props.definition;
  const selectedMessage = account.dashboard.activities[0];
  return (
    <main className={`${styles.dashboard} ${styles.mailDashboard}`} data-mail-refined="true">
      <DashboardSidebar definition={props.definition} showNavigationIcons />
      <div className={styles.mailWorkspace}>
        <section
          className={styles.mailToolbar}
          aria-label={s01Content.siteUi.mailbox.toolbarAriaLabel}
        >
          <div className={styles.mailSearchControl}>
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="5.5" />
              <path d="m15 15 4.5 4.5" />
            </svg>
            {s01Content.siteUi.mailbox.searchLabel}
          </div>
          <span className={styles.mailMessageCount}>
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
              <path d="m4.5 7 7.5 5.8L19.5 7" />
            </svg>
            {s01Content.siteUi.mailbox.messageCount(account.dashboard.activities.length)}
          </span>
        </section>
        <section className={styles.mailColumns}>
          <div className={styles.messageList} aria-label={account.dashboard.activityTitle}>
            <header>
              <h2>{account.dashboard.activityTitle}</h2>
              <span>
                {s01Content.siteUi.mailbox.latestFirst}
                <b aria-hidden="true">⌄</b>
              </span>
            </header>
            {account.dashboard.activities.map((activity, index) => (
              <article key={activity.title} data-selected={index === 0 || undefined}>
                <span className={styles.senderAvatar} aria-hidden="true">
                  {activity.title.slice(0, 1)}
                </span>
                <div>
                  <strong>{activity.title}</strong>
                  <p>{activity.meta}</p>
                </div>
                <time>
                  {index === 0
                    ? s01Content.siteUi.mailbox.newLabel
                    : s01Content.siteUi.mailbox.previousLabel}
                </time>
              </article>
            ))}
          </div>
          <article className={styles.readingPane}>
            <p className={styles.eyebrow}>{s01Content.siteUi.mailbox.selectedMessageLabel}</p>
            <h2>{selectedMessage?.title}</h2>
            <div className={styles.messageMeta}>
              <span className={styles.senderAvatar}>CI</span>
              <div>
                <strong>{s01Content.siteUi.mailbox.senderLabel}</strong>
                <span>{selectedMessage?.meta}</span>
              </div>
            </div>
            <p>{account.overview.description}</p>
            <p>{account.dashboard.summaryCards[2]?.detail}</p>
            <div className={styles.mailActions}>
              <span>↩ {s01Content.siteUi.mailbox.replyLabel}</span>
              <span>→ {s01Content.siteUi.mailbox.forwardLabel}</span>
            </div>
          </article>
        </section>
        <section className={styles.mailStatusGrid} aria-label={s01Content.siteUi.lowerAriaLabel}>
          {account.dashboard.summaryCards.map((card, index) => (
            <article key={card.title}>
              <MailStatusIcon index={index} />
              <div>
                <h2>{card.title}</h2>
                <p>{card.detail}</p>
              </div>
              <i aria-hidden="true" />
            </article>
          ))}
        </section>
        <section className={styles.mailContinuation}>
          {account.dashboard.lowerCards.map((card) => (
            <article key={card.title}>
              <h2>{card.title}</h2>
              <p>{card.detail}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function CommunityDashboard(props: {
  readonly definition: CampusWebsiteDefinition;
  readonly displayName?: string | undefined;
  readonly dashboardHeadingRef?: Ref<HTMLHeadingElement> | undefined;
  readonly dashboardNotice?: ReactNode | undefined;
}) {
  const { account } = props.definition;
  const greetingName = props.displayName?.trim().split(/\s+/u)[0] || 'Campus';
  return (
    <main
      className={`${styles.dashboard} ${styles.communityDashboard}`}
      data-refined="true"
    >
      <DashboardSidebar definition={props.definition} showNavigationIcons />
      <div className={styles.communityContent}>
        <header className={styles.communityToolbar}>
          <h1
            ref={props.dashboardHeadingRef}
            tabIndex={props.dashboardHeadingRef === undefined ? undefined : -1}
          >
            {s01Content.siteUi.greeting(greetingName)}
          </h1>
          <span>⌕ {s01Content.siteUi.community.searchLabel}</span>
          <strong>＋ {s01Content.siteUi.community.createLabel}</strong>
        </header>
        {props.dashboardNotice}
        <section className={styles.topicRail} aria-label={s01Content.siteUi.community.topicsAriaLabel}>
          {s01Content.siteUi.community.topics.map((topic, index) => (
            <span key={topic}>
              <i aria-hidden="true">{topic.slice(0, 1)}</i>
              <strong>{topic}</strong>
              <small>{s01Content.siteUi.community.newCount(index + 2)}</small>
            </span>
          ))}
        </section>
        <section className={styles.communityLeadGrid}>
          {account.dashboard.summaryCards.map((card, index) => (
            <article key={card.title} className={styles.communityCard}>
              <header>
                <span>{card.title}</span>
                <small>{s01Content.siteUi.showAllLabel}</small>
              </header>
              <h2>{index === 0 ? account.dashboard.activities[0]?.title : card.detail}</h2>
              <p>{index === 2 ? account.dashboard.lowerCards[3]?.detail : account.dashboard.activities[index]?.meta}</p>
              <div className={styles.communityFaces} aria-hidden="true"><i /><i /><i /></div>
            </article>
          ))}
        </section>
        <section className={styles.communityBelow} aria-label={s01Content.siteUi.lowerAriaLabel}>
          <div className={styles.discussionList}>
            <header>
              <h2>{account.dashboard.activityTitle}</h2>
              <span>{s01Content.siteUi.showAllLabel}</span>
            </header>
            {account.dashboard.activities.map((activity) => (
              <article key={activity.title}>
                <i aria-hidden="true" />
                <div>
                  <strong>{activity.title}</strong>
                  <span>{activity.meta}</span>
                </div>
                <span>♡</span>
              </article>
            ))}
          </div>
          {account.dashboard.lowerCards.map((card, index) => (
            <article className={styles.communitySideCard} data-card-index={index} key={card.title}>
              <h2>{card.title}</h2>
              <p>{card.detail}</p>
              <span className={styles.cardLink}>{s01Content.siteUi.moreLabel} →</span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function DashboardView(props: {
  readonly definition: CampusWebsiteDefinition;
  readonly displayName?: string | undefined;
  readonly dashboardHeadingRef?: Ref<HTMLHeadingElement> | undefined;
  readonly dashboardNotice?: ReactNode | undefined;
}) {
  switch (props.definition.kind) {
    case 'master-campus':
      return <MasterDashboard {...props} />;
    case 'campus-email':
      return <MailDashboard {...props} />;
    case 'campusgram':
      return <CommunityDashboard {...props} />;
    default: {
      const exhaustiveKind: never = props.definition.kind;
      throw new Error(`unknown-campus-dashboard:${String(exhaustiveKind)}`);
    }
  }
}

export function CampusWebsiteBackdrop({
  accountId,
  children,
  interactionLabel,
  view,
  displayName,
  primaryAction,
  secondaryAction,
  authenticationTitle,
  onBack,
  dashboardHeadingRef,
  dashboardNotice,
  rootRef,
  timeLapseActive = false,
}: CampusWebsiteBackdropProps) {
  const definition = campusWebsiteDefinition(accountId);
  const { account } = definition;

  return (
    <article
      ref={rootRef}
      className={styles.page}
      data-campus-site={account.id}
      data-time-lapse={timeLapseActive || undefined}
      data-view={view}
      aria-label={interactionLabel}
    >
      {view === 'dashboard' ? null : <SiteHeader account={account} view={view} />}
      {view === 'landing' ? (
        <LandingView
          definition={definition}
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
        />
      ) : view === 'authentication' ? (
        <main className={styles.authentication}>
          <section className={styles.authIntro}>
            {onBack === undefined ? null : (
              <button type="button" className={styles.backAction} onClick={onBack}>
                ← {s01Content.siteUi.backLabel}
              </button>
            )}
            <h1>{authenticationTitle}</h1>
          </section>
          <section className={styles.authInteraction}>
            {children}
          </section>
        </main>
      ) : (
        <DashboardView
          definition={definition}
          displayName={displayName}
          dashboardHeadingRef={dashboardHeadingRef}
          dashboardNotice={dashboardNotice}
        />
      )}
    </article>
  );
}
