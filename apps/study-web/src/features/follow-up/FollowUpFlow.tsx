import { followUpRawTokenSchema } from '@passwo/contracts';
import {
  followUpInstrument,
  followUpSubmissionRequestSchema,
  type FollowUpAccessResponse,
  type FollowUpItem,
  type FollowUpSubmissionRequest,
} from '@passwo/contracts/follow-up';
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { useInitialFocus } from '../../app/useInitialFocus.js';
import { loadFollowUpAccess, submitFollowUp } from './follow-up-api.js';
import styles from './FollowUpFlow.module.css';

type FocalActionItem = Extract<FollowUpItem, { readonly type: 'singleChoice' }>;
type ConditionalReasonItem = Extract<FollowUpItem, { readonly type: 'conditionalSingleChoice' }>;
type ChoiceItem = FocalActionItem | ConditionalReasonItem;
type Draft = Readonly<Record<string, string | null>>;
type PageState =
  | { readonly status: 'loading' }
  | { readonly status: 'load-error' }
  | { readonly status: 'submitted-now' }
  | { readonly status: 'resolved'; readonly access: FollowUpAccessResponse };

const content = followUpInstrument;

function FocusedHeading({ id, children }: { readonly id?: string; readonly children: ReactNode }) {
  const headingRef = useInitialFocus<HTMLHeadingElement>();

  return (
    <h1 id={id} ref={headingRef} tabIndex={-1}>
      {children}
    </h1>
  );
}

function initialDraft(): Draft {
  return Object.fromEntries(content.questionnaire.items.map((item) => [item.id, null]));
}

function statusCopy(status: Exclude<FollowUpAccessResponse['status'], 'available'>): {
  readonly heading: string;
  readonly body: string;
} {
  if (status === 'submitted') {
    return {
      heading: content.interface.alreadySubmittedHeading,
      body: content.interface.alreadySubmittedBody,
    };
  }
  if (status === 'not-yet-open') {
    return {
      heading: content.interface.notYetOpenHeading,
      body: content.interface.notYetOpenBody,
    };
  }
  if (status === 'expired') {
    return {
      heading: content.interface.expiredHeading,
      body: content.interface.expiredBody,
    };
  }
  return {
    heading: content.interface.invalidHeading,
    body: content.interface.invalidBody,
  };
}

function StatusPage({ heading, body }: { readonly heading: string; readonly body: string }) {
  return (
    <main className={styles.page}>
      <section className={styles.statusCard} aria-labelledby="follow-up-status-heading">
        <FocusedHeading id="follow-up-status-heading">{heading}</FocusedHeading>
        <p>{body}</p>
      </section>
    </main>
  );
}

function SingleChoiceField({
  item,
  selected,
  onChange,
}: {
  readonly item: ChoiceItem;
  readonly selected: string | null;
  readonly onChange: (optionId: string) => void;
}) {
  return (
    <fieldset
      className={`${styles.questionFieldset} ${
        item.type === 'conditionalSingleChoice' ? styles.reasonFieldset : ''
      }`}
    >
      <legend className={styles.questionPrompt}>{item.prompt}</legend>
      <p className={styles.instruction}>{item.instruction}</p>
      <div className={styles.options}>
        {item.options.map((option) => (
          <label className={styles.option} key={option.id}>
            <input
              checked={selected === option.id}
              name={item.id}
              onChange={() => onChange(option.id)}
              type="radio"
              value={option.id}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FollowUpFlow({
  initialToken,
  apiBasePath = '',
  onSubmitted,
}: {
  readonly initialToken: string | null;
  readonly apiBasePath?: string;
  readonly onSubmitted?: (request: FollowUpSubmissionRequest) => void;
}) {
  const [page, setPage] = useState<PageState>({ status: 'loading' });
  const [started, setStarted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const token = useMemo(() => followUpRawTokenSchema.safeParse(initialToken), [initialToken]);

  useEffect(() => {
    if (!token.success) {
      setPage({ status: 'resolved', access: { status: 'invalid' } });
      return;
    }
    let active = true;
    void loadFollowUpAccess(token.data, apiBasePath)
      .then((access) => {
        if (active) setPage({ status: 'resolved', access });
      })
      .catch(() => {
        if (active) setPage({ status: 'load-error' });
      });
    return () => {
      active = false;
    };
  }, [apiBasePath, token]);

  if (page.status === 'loading') {
    return <StatusPage heading={content.landingPage.title} body={content.interface.loading} />;
  }
  if (page.status === 'load-error') {
    return (
      <StatusPage
        heading={content.interface.loadErrorHeading}
        body={content.interface.loadErrorBody}
      />
    );
  }
  if (page.status === 'submitted-now') {
    return (
      <StatusPage
        heading={content.interface.submittedHeading}
        body={content.interface.submittedBody}
      />
    );
  }
  if (page.access.status !== 'available') {
    const copy = statusCopy(page.access.status);
    return <StatusPage heading={copy.heading} body={copy.body} />;
  }

  const actionItems = content.questionnaire.items.filter(
    (item): item is FocalActionItem => item.type === 'singleChoice',
  );
  const conditionalItems = content.questionnaire.items.filter(
    (item): item is ConditionalReasonItem => item.type === 'conditionalSingleChoice',
  );

  const updateAction = (item: FocalActionItem, optionId: string): void => {
    setDraft((current) => {
      const conditional = conditionalItems.find(
        ({ displayWhen }) => displayWhen.itemId === item.id,
      );
      return {
        ...current,
        [item.id]: optionId,
        ...(conditional === undefined || optionId === conditional.displayWhen.equals
          ? {}
          : { [conditional.id]: null }),
      };
    });
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!token.success) return;
    const request = followUpSubmissionRequestSchema.safeParse({
      token: token.data,
      voluntaryConfirmation: true,
      responses: content.questionnaire.items.map((item) => ({
        itemId: item.id,
        value: draft[item.id] ?? null,
      })),
    });
    if (!request.success) {
      setFormError(content.interface.validationError);
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await submitFollowUp(request.data, apiBasePath);
      setPage({ status: 'submitted-now' });
      onSubmitted?.(request.data);
    } catch {
      setFormError(content.interface.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  if (!started) {
    return (
      <main className={styles.page}>
        <section className={styles.card} aria-labelledby="follow-up-heading">
          <header className={styles.header}>
            <FocusedHeading id="follow-up-heading">{content.landingPage.title}</FocusedHeading>
          </header>
          <p className={styles.disclosure}>{content.landingPage.disclosure}</p>
          <label className={styles.confirmation}>
            <input
              checked={confirmed}
              onChange={(event) => setConfirmed(event.currentTarget.checked)}
              type="checkbox"
            />
            <span>{content.landingPage.voluntaryConfirmation}</span>
          </label>
          <div className={styles.actions}>
            <button disabled={!confirmed} onClick={() => setStarted(true)} type="button">
              {content.interface.startLabel}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={(event) => void handleSubmit(event)}>
        <header className={styles.header}>
          <FocusedHeading>{content.questionnaire.title}</FocusedHeading>
          <p>{content.questionnaire.reportingInstruction}</p>
          <p>{content.questionnaire.accountScopeInstruction}</p>
        </header>
        <p className={styles.safetyNote}>{content.questionnaire.safetyNote}</p>
        <div className={styles.questions}>
          {actionItems.map((item) => {
            const selected = draft[item.id];
            const conditional = conditionalItems.find(
              ({ displayWhen }) => displayWhen.itemId === item.id,
            );
            const showConditional =
              conditional !== undefined && selected === conditional.displayWhen.equals;
            const reason = conditional === undefined ? null : draft[conditional.id];
            return (
              <section className={styles.questionGroup} key={item.id}>
                <SingleChoiceField
                  item={item}
                  selected={typeof selected === 'string' ? selected : null}
                  onChange={(optionId) => updateAction(item, optionId)}
                />
                {showConditional && conditional !== undefined ? (
                  <SingleChoiceField
                    item={conditional}
                    selected={typeof reason === 'string' ? reason : null}
                    onChange={(optionId) => {
                      setDraft((current) => ({ ...current, [conditional.id]: optionId }));
                      setFormError(null);
                    }}
                  />
                ) : null}
              </section>
            );
          })}
        </div>
        {formError === null ? null : (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}
        <div className={styles.actions}>
          <button disabled={submitting} type="submit">
            {submitting ? content.interface.submittingLabel : content.interface.submitLabel}
          </button>
        </div>
      </form>
    </main>
  );
}
