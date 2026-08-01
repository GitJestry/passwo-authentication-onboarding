import { s01Content, type S01AccountId } from '@passwo/training-content';
import type { ReactNode, Ref } from 'react';
import campusgramHero from '../../assets/campus-sites/campusgram-hero.png';
import campusEmailHero from '../../assets/campus-sites/campus-mail-hero.png';
import masterCampusHero from '../../assets/campus-sites/master-campus-hero.png';
import { NetworkSymbol } from '../../adapters/network/NetworkSymbolRegistry.js';
import styles from './CampusWebsiteBackdrop.module.css';

export type CampusWebsiteView = 'context' | 'landing' | 'authentication' | 'dashboard';

export interface CampusWebsiteAction {
  readonly label: string;
  readonly onClick?: (() => void) | undefined;
  readonly disabled?: boolean | undefined;
  readonly disabledReason?: string | undefined;
}

export interface CampusWebsiteBackdropProps {
  readonly accountId: S01AccountId;
  readonly interactionLabel: string;
  readonly view?: CampusWebsiteView;
  readonly children?: ReactNode | undefined;
  readonly displayName?: string | undefined;
  readonly primaryAction?: CampusWebsiteAction | undefined;
  readonly secondaryAction?: CampusWebsiteAction | undefined;
  readonly authenticationTitle?: string | undefined;
  readonly onBack?: (() => void) | undefined;
  readonly dashboardHeadingRef?: Ref<HTMLHeadingElement> | undefined;
  readonly rootRef?: Ref<HTMLElement> | undefined;
  readonly timeLapseActive?: boolean | undefined;
}

type CampusAccount = (typeof s01Content.browser.accounts)[number];

type CampusWebsiteKind = S01AccountId;

interface CampusWebsiteDefinition {
  readonly account: CampusAccount;
  readonly heroImage: string;
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
      return { account: campusAccount(accountId), heroImage: masterCampusHero, kind: accountId };
    case 'campus-email':
      return { account: campusAccount(accountId), heroImage: campusEmailHero, kind: accountId };
    case 'campusgram':
      return { account: campusAccount(accountId), heroImage: campusgramHero, kind: accountId };
    default: {
      const exhaustiveAccountId: never = accountId;
      throw new Error(`unknown-campus-account:${String(exhaustiveAccountId)}`);
    }
  }
}

function SiteVisual({ definition }: { readonly definition: CampusWebsiteDefinition }) {
  return (
    <figure className={styles.heroVisual}>
      <img src={definition.heroImage} alt="" />
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

function DashboardSidebar({ definition }: { readonly definition: CampusWebsiteDefinition }) {
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
            <i aria-hidden="true" />
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

function MasterDashboard(props: {
  readonly definition: CampusWebsiteDefinition;
  readonly displayName?: string | undefined;
  readonly dashboardHeadingRef?: Ref<HTMLHeadingElement> | undefined;
}) {
  const { account } = props.definition;
  return (
    <main className={styles.dashboard}>
      <DashboardSidebar definition={props.definition} />
      <div className={styles.dashboardContent}>
        <DashboardHeading
          account={account}
          displayName={props.displayName}
          dashboardHeadingRef={props.dashboardHeadingRef}
        />
        <section className={styles.masterSummary} aria-label={s01Content.siteUi.summaryAriaLabel}>
          {account.dashboard.summaryCards.map((card) => (
            <article className={styles.hubCard} key={card.title}>
              <h2>{card.title}</h2>
              <p>{card.detail}</p>
              <span className={styles.cardLink}>{s01Content.siteUi.viewLabel} →</span>
            </article>
          ))}
        </section>
        <section className={styles.masterActivity}>
          <header>
            <h2>{account.dashboard.activityTitle}</h2>
            <span>{s01Content.siteUi.showAllLabel}</span>
          </header>
          {account.dashboard.activities.map((activity) => (
            <article key={activity.title}>
              <span className={styles.activityCheck} aria-hidden="true">•</span>
              <div>
                <strong>{activity.title}</strong>
                <span>{activity.meta}</span>
              </div>
              <span aria-hidden="true">›</span>
            </article>
          ))}
        </section>
        <section className={styles.masterLower} aria-label={s01Content.siteUi.lowerAriaLabel}>
          {account.dashboard.lowerCards.slice(0, 3).map((card) => (
            <article key={card.title}>
              <span className={styles.statusRing} aria-hidden="true">✓</span>
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
    <main className={`${styles.dashboard} ${styles.mailDashboard}`}>
      <DashboardSidebar definition={props.definition} />
      <div className={styles.mailWorkspace}>
        <section
          className={styles.mailToolbar}
          aria-label={s01Content.siteUi.mailbox.toolbarAriaLabel}
        >
          <div>⌕ {s01Content.siteUi.mailbox.searchLabel}</div>
          <span>
            {s01Content.siteUi.mailbox.messageCount(account.dashboard.activities.length)}
          </span>
        </section>
        <section className={styles.mailColumns}>
          <div className={styles.messageList} aria-label={account.dashboard.activityTitle}>
            <header>
              <h2>{account.dashboard.activityTitle}</h2>
              <span>{s01Content.siteUi.mailbox.latestFirst}</span>
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
          {account.dashboard.summaryCards.map((card) => (
            <article key={card.title}>
              <h2>{card.title}</h2>
              <p>{card.detail}</p>
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
}) {
  const { account } = props.definition;
  const greetingName = props.displayName?.trim().split(/\s+/u)[0] || 'Campus';
  return (
    <main className={`${styles.dashboard} ${styles.communityDashboard}`}>
      <DashboardSidebar definition={props.definition} />
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

function ContextView({
  account,
  children,
}: {
  readonly account: CampusAccount;
  readonly children?: ReactNode | undefined;
}) {
  return (
    <main className={styles.contextBody}>
      <section className={styles.interactionColumn}>{children}</section>
      <section className={styles.contextPreview} aria-label={`${account.label}-Vorschau`}>
        <div className={styles.contextIntro}>
          <NetworkSymbol symbolId={account.symbolId} className={styles.contextSymbol} />
          <div>
            <p className={styles.eyebrow}>{account.role}</p>
            <h2>{account.overview.title}</h2>
            <p>{account.overview.description}</p>
          </div>
        </div>
        {account.dashboard.summaryCards.map((card) => (
          <article className={styles.contextCard} key={card.title}>
            <strong>{card.title}</strong>
            <span>{card.detail}</span>
          </article>
        ))}
      </section>
    </main>
  );
}

export function CampusWebsiteBackdrop({
  accountId,
  children,
  interactionLabel,
  view = 'context',
  displayName,
  primaryAction,
  secondaryAction,
  authenticationTitle,
  onBack,
  dashboardHeadingRef,
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
      ) : view === 'dashboard' ? (
        <DashboardView
          definition={definition}
          displayName={displayName}
          dashboardHeadingRef={dashboardHeadingRef}
        />
      ) : (
        <ContextView account={account}>{children}</ContextView>
      )}
    </article>
  );
}
