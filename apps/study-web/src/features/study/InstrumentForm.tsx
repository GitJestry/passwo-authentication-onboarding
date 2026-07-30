import {
  guardrailPresentationForForm,
  instrumentRuntimeManifest,
  instrumentSubmissionRequestSchema,
  type GuardrailFormId,
  type InstrumentResponseValue,
  type InstrumentRuntimeManifest,
  type InstrumentSubmissionFor,
  type InstrumentSubmissionRequest,
} from '@passwo/contracts';
import { type FormEvent, useRef, useState } from 'react';
import styles from './StudyFlow.module.css';

type QuestionnaireSection =
  InstrumentRuntimeManifest['instruments']['pre-v1']['sections'][number];
type QuestionnaireItem = QuestionnaireSection['items'][number];
type SingleChoiceItem = Extract<QuestionnaireItem, { readonly type: 'singleChoice' }>;
type MultiChoiceItem = Extract<QuestionnaireItem, { readonly type: 'multiChoice' }>;
type ScaleItem = Extract<QuestionnaireItem, { readonly type: 'scale' }>;
type SemanticDifferentialItem = Extract<
  QuestionnaireItem,
  { readonly type: 'semanticDifferential' }
>;
type IntegerItem = Extract<QuestionnaireItem, { readonly type: 'integer' }>;
type TextItem = Extract<QuestionnaireItem, { readonly type: 'text' }>;
type GuardrailBlock =
  InstrumentRuntimeManifest['instruments']['guardrail-v2']['blocks'][number];
type GuardrailItem = GuardrailBlock['items'][number];
type ChoiceOption = SingleChoiceItem['options'][number];
type QuestionnaireInstrumentId = 'pre-v1' | 'post-v1';
type Draft = Record<string, InstrumentResponseValue | undefined>;

interface FieldStateProps {
  readonly invalid: boolean;
}

function fieldClassName(invalid: boolean): string {
  const fieldClass = styles.field ?? '';
  return invalid ? `${fieldClass} ${styles.fieldInvalid ?? ''}`.trim() : fieldClass;
}

function FieldError({ invalid, itemId }: FieldStateProps & { readonly itemId: string }) {
  if (!invalid) return null;
  return (
    <p className={styles.fieldError} id={`${itemId}-error`}>
      Bitte beantworte dieses Feld vollständig.
    </p>
  );
}

function SingleChoiceList({
  itemId,
  prompt,
  options,
  optional,
  value,
  invalid,
  onChange,
}: {
  readonly itemId: string;
  readonly prompt: string;
  readonly options: readonly ChoiceOption[];
  readonly optional: boolean;
  readonly value: string | undefined;
  readonly invalid: boolean;
  readonly onChange: (value: string) => void;
}) {
  return (
    <fieldset
      className={fieldClassName(invalid)}
      aria-describedby={invalid ? `${itemId}-error` : undefined}
      aria-invalid={invalid}
    >
      <legend>{prompt}</legend>
      {optional ? <p className={styles.fieldHint}>Optional</p> : null}
      <div className={styles.optionList}>
        {options.map((option) => (
          <label className={styles.option} key={option.id}>
            <input
              type="radio"
              name={itemId}
              value={option.id}
              checked={value === option.id}
              required={!optional}
              onChange={() => onChange(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <FieldError invalid={invalid} itemId={itemId} />
    </fieldset>
  );
}

function MultiChoiceList({
  item,
  value,
  invalid,
  onChange,
}: {
  readonly item: MultiChoiceItem;
  readonly value: readonly string[];
  readonly invalid: boolean;
  readonly onChange: (value: string[]) => void;
}) {
  const exclusiveOptions = new Set(item.exclusiveOptions ?? []);

  function update(optionId: string, checked: boolean): void {
    const selected = new Set(value);
    if (checked && exclusiveOptions.has(optionId)) {
      selected.clear();
      selected.add(optionId);
    } else {
      for (const exclusiveOption of exclusiveOptions) selected.delete(exclusiveOption);
      if (checked) selected.add(optionId);
      else selected.delete(optionId);
    }
    onChange(item.options.filter((option) => selected.has(option.id)).map((option) => option.id));
  }

  return (
    <fieldset
      className={fieldClassName(invalid)}
      aria-describedby={invalid ? `${item.id}-error` : undefined}
      aria-invalid={invalid}
      aria-required="true"
    >
      <legend>{item.prompt}</legend>
      {item.instruction === undefined ? null : (
        <p className={styles.fieldHint}>{item.instruction}</p>
      )}
      {item.note === undefined ? null : <p className={styles.fieldHint}>{item.note}</p>}
      <div className={styles.optionList}>
        {item.options.map((option) => (
          <label className={styles.option} key={option.id}>
            <input
              type="checkbox"
              name={item.id}
              value={option.id}
              checked={value.includes(option.id)}
              onChange={(event) => update(option.id, event.currentTarget.checked)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <FieldError invalid={invalid} itemId={item.id} />
    </fieldset>
  );
}

interface DiscreteRadioScaleProps {
  readonly itemId: string;
  readonly legend: string;
  readonly value: number | undefined;
  readonly invalid: boolean;
  readonly points: readonly number[];
  readonly accessibleNames: Readonly<Record<string, string>>;
  readonly visibleLabels: Readonly<Record<string, string>>;
  readonly pointCountClassName: string;
  readonly onChange: (value: number) => void;
}

function DiscreteRadioScale({
  itemId,
  legend,
  value,
  invalid,
  points,
  accessibleNames,
  visibleLabels,
  pointCountClassName,
  onChange,
}: DiscreteRadioScaleProps) {
  return (
    <fieldset
      className={fieldClassName(invalid)}
      aria-describedby={invalid ? `${itemId}-error` : undefined}
      aria-invalid={invalid}
    >
      <legend>{legend}</legend>
      <div className={styles.compactScaleScroller}>
        <div className={`${styles.compactScale ?? ''} ${pointCountClassName}`.trim()}>
          {points.map((point) => {
            const accessibleName = accessibleNames[String(point)];
            const visibleLabel = visibleLabels[String(point)];
            return (
              <label className={styles.compactScalePoint} key={point}>
                <input
                  type="radio"
                  name={itemId}
                  value={point}
                  checked={value === point}
                  required
                  aria-label={`${point}: ${accessibleName ?? visibleLabel ?? legend}`}
                  onChange={() => onChange(point)}
                />
                <span className={styles.scaleNumber}>{point}</span>
                {visibleLabel === undefined ? (
                  <span className={styles.scaleLabelPlaceholder} aria-hidden="true">
                    &nbsp;
                  </span>
                ) : (
                  <span className={styles.compactScaleLabel}>{visibleLabel}</span>
                )}
              </label>
            );
          })}
        </div>
      </div>
      <FieldError invalid={invalid} itemId={itemId} />
    </fieldset>
  );
}

const points5 = [1, 2, 3, 4, 5] as const;
const points7 = [1, 2, 3, 4, 5, 6, 7] as const;
const points11 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function Agreement7(props: Omit<DiscreteRadioScaleProps, 'points' | 'accessibleNames' | 'visibleLabels' | 'pointCountClassName'>) {
  const anchors = instrumentRuntimeManifest.scales.agreement7.anchors;
  return (
    <DiscreteRadioScale
      {...props}
      points={points7}
      accessibleNames={anchors}
      visibleLabels={{ 1: anchors['1'], 4: anchors['4'], 7: anchors['7'] }}
      pointCountClassName={styles.scalePointCount7 ?? ''}
    />
  );
}

function Confidence11(props: Omit<DiscreteRadioScaleProps, 'points' | 'accessibleNames' | 'visibleLabels' | 'pointCountClassName'>) {
  const anchors = instrumentRuntimeManifest.scales.confidence11.anchors;
  return (
    <DiscreteRadioScale
      {...props}
      points={points11}
      accessibleNames={{
        ...Object.fromEntries(points11.map((point) => [String(point), `Konfidenz ${point} von 10`])),
        ...anchors,
      }}
      visibleLabels={{ 0: anchors['0'], 5: anchors['5'], 10: anchors['10'] }}
      pointCountClassName={styles.scalePointCount11 ?? ''}
    />
  );
}

function Familiarity5(props: Omit<DiscreteRadioScaleProps, 'points' | 'accessibleNames' | 'visibleLabels' | 'pointCountClassName'>) {
  const anchors = instrumentRuntimeManifest.scales.familiarity5.anchors;
  return (
    <DiscreteRadioScale
      {...props}
      points={points5}
      accessibleNames={anchors}
      visibleLabels={anchors}
      pointCountClassName={styles.scalePointCount5 ?? ''}
    />
  );
}

function Intensity5(props: Omit<DiscreteRadioScaleProps, 'points' | 'accessibleNames' | 'visibleLabels' | 'pointCountClassName'>) {
  const anchors = instrumentRuntimeManifest.scales.intensity5.anchors;
  return (
    <DiscreteRadioScale
      {...props}
      points={points5}
      accessibleNames={anchors}
      visibleLabels={anchors}
      pointCountClassName={styles.scalePointCount5 ?? ''}
    />
  );
}

function DurationAppropriateness7(props: Omit<DiscreteRadioScaleProps, 'points' | 'accessibleNames' | 'visibleLabels' | 'pointCountClassName'>) {
  const anchors = instrumentRuntimeManifest.scales.durationAppropriateness7.anchors;
  return (
    <DiscreteRadioScale
      {...props}
      points={points7}
      accessibleNames={{
        ...Object.fromEntries(
          points7.map((point) => [String(point), `Dauerangemessenheit ${point} von 7`]),
        ),
        ...anchors,
      }}
      visibleLabels={{ 1: anchors['1'], 4: anchors['4'], 7: anchors['7'] }}
      pointCountClassName={styles.scalePointCount7 ?? ''}
    />
  );
}

function ScaleField({
  item,
  value,
  invalid,
  onChange,
}: {
  readonly item: ScaleItem;
  readonly value: number | undefined;
  readonly invalid: boolean;
  readonly onChange: (value: number) => void;
}) {
  const sharedProps = {
    itemId: item.id,
    legend: item.prompt ?? item.label ?? item.id,
    value,
    invalid,
    onChange,
  };
  switch (item.scale) {
    case 'agreement7':
      return <Agreement7 {...sharedProps} />;
    case 'confidence11':
      return <Confidence11 {...sharedProps} />;
    case 'familiarity5':
      return <Familiarity5 {...sharedProps} />;
    case 'intensity5':
      return <Intensity5 {...sharedProps} />;
    case 'durationAppropriateness7':
      return <DurationAppropriateness7 {...sharedProps} />;
  }
}

function UEQSemanticDifferential7({
  item,
  value,
  invalid,
  onChange,
}: {
  readonly item: SemanticDifferentialItem;
  readonly value: number | undefined;
  readonly invalid: boolean;
  readonly onChange: (value: number) => void;
}) {
  const scale = instrumentRuntimeManifest.scales.ueqSemanticDifferential7;
  const points = Array.from(
    { length: scale.max - scale.min + 1 },
    (_, index) => scale.min + index,
  );

  return (
    <fieldset
      className={fieldClassName(invalid)}
      aria-describedby={invalid ? `${item.id}-error` : undefined}
      aria-invalid={invalid}
    >
      <legend>
        {item.left} – {item.right}
      </legend>
      <div className={styles.ueqScaleScroller}>
        <div className={styles.ueqScale}>
          <span className={styles.ueqTerm}>{item.left}</span>
          <div className={styles.ueqPoints}>
            {points.map((point) => (
              <label className={styles.ueqPoint} key={point}>
                <input
                  type="radio"
                  name={item.id}
                  value={point}
                  checked={value === point}
                  required
                  aria-label={`Position ${point} von 7 zwischen ${item.left} und ${item.right}`}
                  onChange={() => onChange(point)}
                />
              </label>
            ))}
          </div>
          <span className={`${styles.ueqTerm ?? ''} ${styles.ueqTermRight ?? ''}`.trim()}>
            {item.right}
          </span>
        </div>
      </div>
      <FieldError invalid={invalid} itemId={item.id} />
    </fieldset>
  );
}

function IntegerField({
  item,
  value,
  invalid,
  onChange,
}: {
  readonly item: IntegerItem;
  readonly value: number | undefined;
  readonly invalid: boolean;
  readonly onChange: (value: number | undefined) => void;
}) {
  return (
    <div className={fieldClassName(invalid)}>
      <label className={styles.fieldLabel} htmlFor={item.id}>
        {item.prompt}
      </label>
      <input
        className={styles.numberInput}
        id={item.id}
        name={item.id}
        type="number"
        inputMode="numeric"
        min={item.min}
        max={item.max}
        step={1}
        value={value ?? ''}
        required
        aria-describedby={invalid ? `${item.id}-error` : undefined}
        aria-invalid={invalid}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          onChange(nextValue === '' ? undefined : event.currentTarget.valueAsNumber);
        }}
      />
      <p className={styles.fieldHint}>
        Ganze Zahl von {item.min} bis {item.max}
      </p>
      <FieldError invalid={invalid} itemId={item.id} />
    </div>
  );
}

function OptionalTextField({
  item,
  value,
  invalid,
  onChange,
}: {
  readonly item: TextItem;
  readonly value: string;
  readonly invalid: boolean;
  readonly onChange: (value: string) => void;
}) {
  return (
    <div className={fieldClassName(invalid)}>
      <label className={styles.fieldLabel} htmlFor={item.id}>
        {item.prompt}
      </label>
      <p className={styles.fieldHint}>Optional, maximal {item.maxLength} Zeichen</p>
      <textarea
        className={styles.textarea}
        id={item.id}
        name={item.id}
        value={value}
        maxLength={item.maxLength}
        rows={5}
        aria-describedby={invalid ? `${item.id}-error` : undefined}
        aria-invalid={invalid}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      <FieldError invalid={invalid} itemId={item.id} />
    </div>
  );
}

function invalidSubmissionItems(submission: InstrumentSubmissionRequest): Set<string> | null {
  const result = instrumentSubmissionRequestSchema.safeParse(submission);
  if (result.success) return null;

  const invalidItemIds = new Set<string>();
  for (const issue of result.error.issues) {
    const responseIdentifier = issue.path[1];
    if (typeof responseIdentifier === 'string') {
      invalidItemIds.add(responseIdentifier);
      continue;
    }
    if (typeof responseIdentifier === 'number') {
      const response = submission.responses[responseIdentifier];
      if (response !== undefined) invalidItemIds.add(response.itemId);
    }
  }
  if (invalidItemIds.size === 0) {
    for (const response of submission.responses) invalidItemIds.add(response.itemId);
  }
  return invalidItemIds;
}

function questionnaireValue(
  item: QuestionnaireItem,
  draftValue: InstrumentResponseValue | undefined,
): InstrumentResponseValue {
  if (item.type === 'text') {
    return typeof draftValue === 'string' && draftValue.trim().length > 0 ? draftValue : null;
  }
  if (item.type === 'singleChoice' && item.participantOptional === true) {
    return draftValue ?? null;
  }
  return draftValue ?? null;
}

function stringDraftValue(value: InstrumentResponseValue | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function QuestionnaireItemField({
  item,
  value,
  invalid,
  onChange,
}: {
  readonly item: QuestionnaireItem;
  readonly value: InstrumentResponseValue | undefined;
  readonly invalid: boolean;
  readonly onChange: (value: InstrumentResponseValue | undefined) => void;
}) {
  switch (item.type) {
    case 'singleChoice':
      return (
        <SingleChoiceList
          itemId={item.id}
          prompt={item.prompt}
          options={item.options}
          optional={item.participantOptional === true}
          value={typeof value === 'string' ? value : undefined}
          invalid={invalid}
          onChange={onChange}
        />
      );
    case 'multiChoice':
      return (
        <MultiChoiceList
          item={item}
          value={Array.isArray(value) ? value : []}
          invalid={invalid}
          onChange={onChange}
        />
      );
    case 'scale':
      return (
        <ScaleField
          item={item}
          value={typeof value === 'number' ? value : undefined}
          invalid={invalid}
          onChange={onChange}
        />
      );
    case 'semanticDifferential':
      return (
        <UEQSemanticDifferential7
          item={item}
          value={typeof value === 'number' ? value : undefined}
          invalid={invalid}
          onChange={onChange}
        />
      );
    case 'integer':
      return (
        <IntegerField
          item={item}
          value={typeof value === 'number' ? value : undefined}
          invalid={invalid}
          onChange={onChange}
        />
      );
    case 'text':
      return (
        <OptionalTextField
          item={item}
          value={typeof value === 'string' ? value : ''}
          invalid={invalid}
          onChange={onChange}
        />
      );
  }
}

export function QuestionnaireSectionForm<
  TInstrumentId extends QuestionnaireInstrumentId,
>({
  instrumentId,
  section,
  eyebrow,
  title,
  progressLabel,
  submitLabel,
  onSubmit,
}: {
  readonly instrumentId: TInstrumentId;
  readonly section: QuestionnaireSection;
  readonly eyebrow: string;
  readonly title: string;
  readonly progressLabel: string;
  readonly submitLabel: string;
  readonly onSubmit: (submission: InstrumentSubmissionFor<TInstrumentId>) => void;
}) {
  const [draft, setDraft] = useState<Draft>({});
  const [invalidItemIds, setInvalidItemIds] = useState<ReadonlySet<string>>(new Set<string>());
  const formRef = useRef<HTMLFormElement>(null);
  const headingId = `${instrumentId}-${section.id}-title`;

  function updateDraft(itemId: string, value: InstrumentResponseValue | undefined): void {
    setDraft((current) => ({ ...current, [itemId]: value }));
    setInvalidItemIds((current) => {
      if (!current.has(itemId)) return current;
      const next = new Set(current);
      next.delete(itemId);
      return next;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const submission: InstrumentSubmissionFor<TInstrumentId> = {
      instrumentId,
      sectionId: section.id,
      responses: section.items.map((item) => ({
        itemId: item.id,
        value: questionnaireValue(item, draft[item.id]),
      })),
    };
    const invalid = invalidSubmissionItems(submission);
    if (invalid !== null) {
      setInvalidItemIds(invalid);
      const firstInvalidItemId = invalid.values().next().value;
      if (typeof firstInvalidItemId === 'string') {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${firstInvalidItemId}"]`)
          ?.focus();
      }
      return;
    }
    onSubmit(submission);
  }

  return (
    <section aria-labelledby={headingId}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 id={headingId} tabIndex={-1} autoFocus>
        {title}
      </h1>
      <p className={styles.progress}>{progressLabel}</p>
      {section.instruction === undefined ? null : (
        <p className={styles.sectionInstruction}>{section.instruction}</p>
      )}
      <form className={styles.instrumentForm} ref={formRef} noValidate onSubmit={submit}>
        {section.items.map((item) => (
          <QuestionnaireItemField
            key={item.id}
            item={item}
            value={draft[item.id]}
            invalid={invalidItemIds.has(item.id)}
            onChange={(value) => updateDraft(item.id, value)}
          />
        ))}
        {invalidItemIds.size === 0 ? null : (
          <div className={styles.validationSummary} role="alert">
            Bitte prüfe die markierten Felder. Der Abschnitt wurde noch nicht abgegeben.
          </div>
        )}
        <button className={styles.button} type="submit">
          {submitLabel}
        </button>
      </form>
    </section>
  );
}

function orderedGuardrailOptions(
  item: GuardrailItem,
  sectionId: string,
  formId: GuardrailFormId,
): readonly ChoiceOption[] | null {
  const presentation = guardrailPresentationForForm(formId).find(
    (candidate) => candidate.sectionId === sectionId && candidate.itemId === item.id,
  );
  if (
    presentation === undefined ||
    presentation.displayedOptionIds.length !== item.options.length ||
    new Set(presentation.displayedOptionIds).size !== item.options.length
  ) {
    return null;
  }

  const options: ChoiceOption[] = [];
  for (const optionId of presentation.displayedOptionIds) {
    const option = item.options.find((candidate) => candidate.id === optionId);
    if (option === undefined) return null;
    options.push(option);
  }
  return options;
}

export function GuardrailBlockForm({
  block,
  formId,
  blockNumber,
  blockCount,
  onSubmit,
}: {
  readonly block: GuardrailBlock;
  readonly formId: GuardrailFormId;
  readonly blockNumber: number;
  readonly blockCount: number;
  readonly onSubmit: (submission: InstrumentSubmissionFor<'guardrail-v2'>) => void;
}) {
  const [draft, setDraft] = useState<Draft>({});
  const [invalidItemIds, setInvalidItemIds] = useState<ReadonlySet<string>>(new Set<string>());
  const formRef = useRef<HTMLFormElement>(null);
  const presentedItems: {
    readonly item: GuardrailItem;
    readonly options: readonly ChoiceOption[];
  }[] = [];

  for (const item of block.items) {
    const options = orderedGuardrailOptions(item, block.id, formId);
    if (options === null) {
      return (
        <section aria-labelledby="guardrail-configuration-error-title" role="alert">
          <p className={styles.eyebrow}>Technische Unterbrechung</p>
          <h1 id="guardrail-configuration-error-title" tabIndex={-1} autoFocus>
            Abschlussfragen nicht verfügbar
          </h1>
          <p className={styles.errorCode}>Fehlercode: guardrail-presentation-invalid</p>
        </section>
      );
    }
    presentedItems.push({ item, options });
  }

  function updateDraft(itemId: string, value: string): void {
    setDraft((current) => ({ ...current, [itemId]: value }));
    setInvalidItemIds((current) => {
      if (!current.has(itemId)) return current;
      const next = new Set(current);
      next.delete(itemId);
      return next;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const submission: InstrumentSubmissionFor<'guardrail-v2'> = {
      instrumentId: 'guardrail-v2',
      sectionId: block.id,
      responses: block.items.map((item) => ({
        itemId: item.id,
        value: draft[item.id] ?? null,
      })),
    };
    const invalid = invalidSubmissionItems(submission);
    if (invalid !== null) {
      setInvalidItemIds(invalid);
      const firstInvalidItemId = invalid.values().next().value;
      if (typeof firstInvalidItemId === 'string') {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${firstInvalidItemId}"]`)
          ?.focus();
      }
      return;
    }
    onSubmit(submission);
  }

  return (
    <section aria-labelledby="guardrail-title">
      <p className={styles.eyebrow}>Verständnis</p>
      <h1 id="guardrail-title" tabIndex={-1} autoFocus>
        {instrumentRuntimeManifest.instruments['guardrail-v2'].participantTitle}
      </h1>
      <p className={styles.progress}>
        Teil {blockNumber} von {blockCount}
      </p>
      <form className={styles.instrumentForm} ref={formRef} noValidate onSubmit={submit}>
        {presentedItems.map(({ item, options }) => (
          <SingleChoiceList
            key={item.id}
            itemId={item.id}
            prompt={item.prompt}
            options={options}
            optional={false}
            value={stringDraftValue(draft[item.id])}
            invalid={invalidItemIds.has(item.id)}
            onChange={(value) => updateDraft(item.id, value)}
          />
        ))}
        {invalidItemIds.size === 0 ? null : (
          <div className={styles.validationSummary} role="alert">
            Bitte beantworte alle Fragen. Der Teil wurde noch nicht abgegeben.
          </div>
        )}
        <button className={styles.button} type="submit">
          Antworten verbindlich abgeben
        </button>
      </form>
    </section>
  );
}

export function PostOpenForm({
  onSubmit,
}: {
  readonly onSubmit: (submission: InstrumentSubmissionFor<'post-open-v1'>) => void;
}) {
  const instrument = instrumentRuntimeManifest.instruments['post-open-v1'];
  const [draft, setDraft] = useState<Draft>({});
  const [invalidItemIds, setInvalidItemIds] = useState<ReadonlySet<string>>(new Set<string>());

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const submission: InstrumentSubmissionFor<'post-open-v1'> = {
      instrumentId: 'post-open-v1',
      sectionId: 'post-open',
      responses: instrument.items.map((item) => {
        const value = draft[item.id];
        return {
          itemId: item.id,
          value: typeof value === 'string' && value.trim().length > 0 ? value : null,
        };
      }),
    };
    const invalid = invalidSubmissionItems(submission);
    if (invalid !== null) {
      setInvalidItemIds(invalid);
      return;
    }
    onSubmit(submission);
  }

  return (
    <section aria-labelledby="post-open-title">
      <p className={styles.eyebrow}>Offene Rückmeldung</p>
      <h1 id="post-open-title" tabIndex={-1} autoFocus>
        Deine Rückmeldung
      </h1>
      <div className={styles.notice}>{instrument.warning}</div>
      <form className={styles.instrumentForm} noValidate onSubmit={submit}>
        {instrument.items.map((item) => (
          <OptionalTextField
            key={item.id}
            item={item}
            value={stringDraftValue(draft[item.id]) ?? ''}
            invalid={invalidItemIds.has(item.id)}
            onChange={(value) => {
              setDraft((current) => ({ ...current, [item.id]: value }));
              setInvalidItemIds((current) => {
                if (!current.has(item.id)) return current;
                const next = new Set(current);
                next.delete(item.id);
                return next;
              });
            }}
          />
        ))}
        {invalidItemIds.size === 0 ? null : (
          <div className={styles.validationSummary} role="alert">
            Die Rückmeldung konnte noch nicht vorbereitet werden.
          </div>
        )}
        <button className={styles.button} type="submit">
          Rückmeldung abgeben
        </button>
      </form>
    </section>
  );
}
