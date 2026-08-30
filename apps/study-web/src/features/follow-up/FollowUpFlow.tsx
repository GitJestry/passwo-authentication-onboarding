import { followUpRawTokenSchema } from '@passwo/contracts';
import {
  followUpInstrument,
  followUpSubmissionRequestSchema,
  type FollowUpAccessResponse,
  type FollowUpItem,
} from '@passwo/contracts/follow-up';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { loadFollowUpAccess, submitFollowUp } from './follow-up-api.js';
import styles from './FollowUpFlow.module.css';

type MultiChoiceItem = Extract<FollowUpItem, { readonly type: 'multiChoice' }>;
type SingleChoiceItem = Extract<FollowUpItem, { readonly type: 'singleChoice' }>;
type Draft = Readonly<Record<string, readonly string[] | string | null>>;
type PageState =
  | { readonly status: 'loading' }
  | { readonly status: 'load-error' }
  | { readonly status: 'submitted-now' }
  | { readonly status: 'resolved'; readonly access: FollowUpAccessResponse };

const content = followUpInstrument;

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'long',
    timeZone: 'Europe/Berlin',
  }).format(new Date(value));
}

function initialDraft(): Draft {
  return Object.fromEntries(
    content.questionnaire.items.map((item) => [item.id, item.type === 'multiChoice' ? [] : null]),
  );
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
        <h1 id="follow-up-status-heading" tabIndex={-1} autoFocus>
          {heading}
        </h1>
        <p>{body}</p>
      </section>
    </main>
  );
}

function MultiChoiceField({
  item,
  selected,
  onChange,
}: {
  readonly item: MultiChoiceItem;
  readonly selected: readonly string[];
  readonly onChange: (optionId: string, checked: boolean) => void;
}) {
  return (
    <fieldset className={styles.questionFieldset}>
      <legend>
        <span className={styles.questionHeading}>{item.heading}</span>
        <span className={styles.questionPrompt}>{item.prompt}</span>
      </legend>
      <p className={styles.instruction}>{item.instruction}</p>
      <div className={styles.options}>
        {item.options.map((option) => (
          <label className={styles.option} key={option.id}>
            <input
              checked={selected.includes(option.id)}
              onChange={(event) => onChange(option.id, event.currentTarget.checked)}
              type="checkbox"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SingleChoiceField({
  item,
  selected,
  onChange,
}: {
  readonly item: SingleChoiceItem;
  readonly selected: string | null;
  readonly onChange: (optionId: string) => void;
}) {
  return (
    <fieldset className={`${styles.questionFieldset} ${styles.reasonFieldset}`}>
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

export function FollowUpFlow({ initialToken }: { readonly initialToken: string | null }) {
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
    void loadFollowUpAccess(token.data)
      .then((access) => {
        if (active) setPage({ status: 'resolved', access });
      })
      .catch(() => {
        if (active) setPage({ status: 'load-error' });
      });
    return () => {
      active = false;
    };
  }, [token]);

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
    (item): item is MultiChoiceItem => item.type === 'multiChoice',
  );
  const conditionalItems = content.questionnaire.items.filter(
    (item): item is SingleChoiceItem => item.type === 'singleChoice',
  );
  const reportingInstruction = content.questionnaire.reportingInstruction.replace(
    '[STICHTAG]',
    dateLabel(page.access.reportingCutoffAtIso),
  );

  const updateActions = (item: MultiChoiceItem, optionId: string, checked: boolean): void => {
    setDraft((current) => {
      const selected = current[item.id];
      const values = Array.isArray(selected) ? selected : [];
      const exclusive = item.exclusiveOptions.includes(optionId);
      const next = checked
        ? exclusive
          ? [optionId]
          : [...values.filter((value) => !item.exclusiveOptions.includes(value)), optionId]
        : values.filter((value) => value !== optionId);
      const conditional = conditionalItems.find(
        ({ displayWhen }) => displayWhen.itemId === item.id,
      );
      return {
        ...current,
        [item.id]: next,
        ...(conditional === undefined || next.includes(conditional.displayWhen.contains)
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
      await submitFollowUp(request.data);
      setPage({ status: 'submitted-now' });
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
            <h1 id="follow-up-heading" tabIndex={-1} autoFocus>
              {content.landingPage.title}
            </h1>
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
          <h1 tabIndex={-1} autoFocus>
            {content.questionnaire.title}
          </h1>
          <p>{reportingInstruction}</p>
        </header>
        <p className={styles.safetyNote}>{content.questionnaire.safetyNote}</p>
        <div className={styles.questions}>
          {actionItems.map((item) => {
            const selected = draft[item.id];
            const selectedValues = Array.isArray(selected) ? selected : [];
            const conditional = conditionalItems.find(
              ({ displayWhen }) => displayWhen.itemId === item.id,
            );
            const showConditional =
              conditional !== undefined &&
              selectedValues.includes(conditional.displayWhen.contains);
            const reason = conditional === undefined ? null : draft[conditional.id];
            return (
              <section className={styles.questionGroup} key={item.id}>
                <MultiChoiceField
                  item={item}
                  selected={selectedValues}
                  onChange={(optionId, checked) => updateActions(item, optionId, checked)}
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
