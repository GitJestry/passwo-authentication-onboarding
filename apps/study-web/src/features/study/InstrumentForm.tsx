import {
  guardrailPresentationForForm,
  guardrailQuestionOrderForForm,
  instrumentRuntimeManifest,
  instrumentSubmissionRequestSchema,
  type GuardrailFormId,
  type InstrumentResponseValue,
  type InstrumentRuntimeManifest,
  type InstrumentSubmissionFor,
  type InstrumentSubmissionRequest,
} from '@passwo/contracts';
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import styles from './StudyFlow.module.css';

type QuestionnaireSection = InstrumentRuntimeManifest['instruments']['pre-v1']['sections'][number];
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
type Agreement7Item = ScaleItem & { readonly scale: 'agreement7' };
type PanasIntensity5Item = ScaleItem & { readonly scale: 'panasIntensity5' };
type Confidence11Item = ScaleItem & { readonly scale: 'confidence11' };
type FullyLabelled7Item = ScaleItem & {
  readonly scale: 'durationAppropriateness7' | 'perceivedDuration7' | 'riskPresentation7';
};
type GuardrailBlock = InstrumentRuntimeManifest['instruments']['guardrail-v2']['blocks'][number];
type GuardrailItem = GuardrailBlock['items'][number];
type ChoiceOption = SingleChoiceItem['options'][number];
type QuestionnaireInstrumentId = 'pre-v1' | 'post-v1';
type Draft = Record<string, InstrumentResponseValue | undefined>;

interface InstrumentProgressStep {
  readonly label: string;
  readonly pageCount: number;
  readonly pageLabels?: readonly string[];
}

function draftFromSubmission(submission: InstrumentSubmissionRequest | null): Draft {
  const draft: Draft = {};
  if (submission === null) return draft;
  for (const response of submission.responses) {
    draft[response.itemId] = response.value;
  }
  return draft;
}

function polarPoint(angle: number, radius: number): readonly [number, number] {
  const radians = ((angle - 90) * Math.PI) / 180;
  return [50 + radius * Math.cos(radians), 50 + radius * Math.sin(radians)];
}

function progressArcPath(pageIndex: number, pageCount: number): string {
  const stepAngle = 360 / pageCount;
  const gapAngle = Math.min(8, stepAngle * 0.18);
  const startAngle = pageIndex * stepAngle + gapAngle / 2;
  const endAngle = (pageIndex + 1) * stepAngle - gapAngle / 2;
  const [startX, startY] = polarPoint(startAngle, 39);
  const [endX, endY] = polarPoint(endAngle, 39);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${startX} ${startY} A 39 39 0 ${largeArcFlag} 1 ${endX} ${endY}`;
}

function SectionProgressRing({
  pageCount,
  filledPageCount,
}: {
  readonly pageCount: number;
  readonly filledPageCount: number;
}) {
  return (
    <svg
      aria-hidden="true"
      className={styles.sectionProgressRing}
      viewBox="0 0 100 100"
    >
      {Array.from({ length: pageCount }, (_, pageIndex) => (
        <path
          className={`${styles.sectionProgressBar} ${
            pageIndex < filledPageCount ? styles.sectionProgressBarFilled : ''
          }`.trim()}
          d={progressArcPath(pageIndex, pageCount)}
          key={pageIndex}
        />
      ))}
    </svg>
  );
}

function InstrumentHeader({
  headingId,
  title,
  currentStep,
  totalSteps,
  stepNoun,
  progressSteps,
  currentPage,
  progressCurrent,
}: {
  readonly headingId: string;
  readonly title: string;
  readonly currentStep?: number;
  readonly totalSteps?: number;
  readonly stepNoun?: string;
  readonly progressSteps: readonly InstrumentProgressStep[];
  readonly currentPage?: number;
  readonly progressCurrent?: number;
}) {
  const resolvedTotal = progressSteps?.length ?? totalSteps;
  const resolvedCurrent = progressCurrent ?? currentStep;
  const showProgress =
    (progressSteps !== undefined && progressSteps.length > 0) ||
    (resolvedTotal !== undefined && resolvedCurrent !== undefined);
  if (!showProgress) {
    return (
      <header className={styles.instrumentHeader}>
        <h1 id={headingId} tabIndex={-1} autoFocus>
          {title}
        </h1>
      </header>
    );
  }

  const normalizedTotal = Math.max(1, resolvedTotal ?? 1);
  const normalizedCurrent = Math.min(
    normalizedTotal,
    Math.max(1, resolvedCurrent ?? 1),
  );
  const steps: readonly InstrumentProgressStep[] =
    progressSteps ??
    Array.from({ length: normalizedTotal }, (_, index) => ({
      label: `${stepNoun ?? 'Abschnitt'} ${index + 1}`,
      pageCount: 1,
    }));
  const activeStep = steps[normalizedCurrent - 1] ?? steps[0];
  const activePageTotal = Math.max(1, activeStep?.pageCount ?? 1);
  const normalizedCurrentPage = Math.min(
    activePageTotal,
    Math.max(1, currentPage ?? 1),
  );
  const activePageLabel = activeStep?.pageLabels?.[normalizedCurrentPage - 1];
  const liveStatus = `${activeStep?.label ?? `${stepNoun ?? 'Abschnitt'} ${normalizedCurrent}`}, Seite ${normalizedCurrentPage} von ${activePageTotal}${
    activePageLabel === undefined ? '' : `, ${activePageLabel}`
  }`;

  return (
    <header className={styles.instrumentHeader}>
      <h1 id={headingId} tabIndex={-1} autoFocus>
        {title}
      </h1>
      <ol
        className={`${styles.sectionProgressLine} ${
          normalizedTotal <= 2 ? styles.sectionProgressLineCompact : ''
        }`.trim()}
        aria-label="Fragebogenfortschritt"
      >
        {Array.from({ length: normalizedTotal }, (_, index) => {
          const step = index + 1;
          const state =
            step < normalizedCurrent
              ? 'completed'
              : step === normalizedCurrent
                ? 'current'
                : 'upcoming';
          const progressClassName =
            state === 'completed'
              ? styles.sectionProgressCompleted
              : state === 'current'
                ? styles.sectionProgressCurrent
                : '';
          const progressStep = steps[index] ?? {
            label: `${stepNoun ?? 'Abschnitt'} ${step}`,
            pageCount: 1,
          };
          const pageCount = Math.max(1, progressStep.pageCount);
          const filledPageCount =
            state === 'completed' ? pageCount : state === 'current' ? normalizedCurrentPage : 0;
          const progressNodeClassName =
            state === 'completed'
              ? `${styles.sectionProgressNode} ${styles.sectionProgressCompleted}`
              : state === 'current'
                ? `${styles.sectionProgressNode} ${styles.sectionProgressCurrent}`
                : styles.sectionProgressNode;
          const stateText =
            state === 'current'
              ? `aktuell, Seite ${normalizedCurrentPage} von ${activePageTotal}`
              : state === 'completed'
                ? 'abgeschlossen'
                : 'folgt später';

          return (
            <li
              aria-current={step === normalizedCurrent ? 'step' : undefined}
              className={progressClassName}
              key={step}
            >
              <span className={progressNodeClassName} aria-hidden="true">
                <SectionProgressRing
                  pageCount={pageCount}
                  filledPageCount={filledPageCount}
                />
                {step}
              </span>
              <span className={styles.visuallyHidden}>
                {`${stepNoun ?? 'Abschnitt'} ${step}: ${progressStep.label}, ${stateText}, ${pageCount} Seiten`}
              </span>
            </li>
          );
        })}
      </ol>
      <p className={styles.visuallyHidden} aria-live="polite">
        {liveStatus}
      </p>
    </header>
  );
}

function ForwardIcon() {
  return (
    <svg aria-hidden="true" className={styles.buttonIcon} viewBox="0 0 24 24">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg aria-hidden="true" className={styles.buttonIcon} viewBox="0 0 24 24">
      <path d="M19 12H5m5-5-5 5 5 5" />
    </svg>
  );
}

function FormInformationIcon() {
  return (
    <span className={styles.informationIcon} aria-hidden="true">
      i
    </span>
  );
}

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

interface NativeRadioControlProps {
  readonly itemId: string;
  readonly point: number;
  readonly checked: boolean;
  readonly accessibleName: string;
  readonly onChange: (value: number) => void;
}

function NativeRadioControl({
  itemId,
  point,
  checked,
  accessibleName,
  onChange,
}: NativeRadioControlProps) {
  return (
    <label className={styles.matrixRadio}>
      <input
        type="radio"
        name={itemId}
        value={point}
        checked={checked}
        required
        aria-label={accessibleName}
        onChange={() => onChange(point)}
      />
    </label>
  );
}

const points5 = [1, 2, 3, 4, 5] as const;
const points7 = [1, 2, 3, 4, 5, 6, 7] as const;
const points11 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function requiredAnchor(anchors: Readonly<Record<string, string>>, point: number): string {
  const anchor = anchors[String(point)];
  if (anchor === undefined) throw new Error(`missing-scale-anchor-${point}`);
  return anchor;
}

function hasAnchor(anchors: object, point: number): boolean {
  return Object.prototype.hasOwnProperty.call(anchors, String(point));
}

interface MatrixProps<TItem extends ScaleItem> {
  readonly items: readonly TItem[];
  readonly draft: Draft;
  readonly invalidItemIds: ReadonlySet<string>;
  readonly onChange: (itemId: string, value: number) => void;
}

function MatrixHeader({
  accessibleLabel,
  children,
}: {
  readonly accessibleLabel: string;
  readonly children: ReactNode;
}) {
  return (
    <div className={styles.matrixHeader} aria-label={accessibleLabel}>
      <span className={styles.matrixHeaderSpacer} aria-hidden="true" />
      {children}
    </div>
  );
}

function MatrixRow({
  item,
  invalid,
  children,
}: {
  readonly item: ScaleItem;
  readonly invalid: boolean;
  readonly children: ReactNode;
}) {
  const label = item.label ?? item.prompt ?? item.id;
  return (
    <fieldset
      className={`${styles.matrixRow ?? ''} ${
        invalid ? (styles.matrixRowInvalid ?? '') : ''
      }`.trim()}
      aria-describedby={invalid ? `${item.id}-error` : undefined}
      aria-invalid={invalid}
    >
      <legend className={styles.visuallyHidden}>{label}</legend>
      <span className={styles.matrixRowLabel} aria-hidden="true">
        {label}
      </span>
      {children}
      <FieldError invalid={invalid} itemId={item.id} />
    </fieldset>
  );
}

function MatrixNumber({ point }: { readonly point: number }) {
  return (
    <span className={styles.matrixNumber} aria-hidden="true">
      {point}
    </span>
  );
}

function PanasIntensity5Matrix({
  items,
  draft,
  invalidItemIds,
  onChange,
}: MatrixProps<PanasIntensity5Item>) {
  const anchors = instrumentRuntimeManifest.scales.panasIntensity5.anchors;
  return (
    <div className={styles.agreementList} aria-label="Intensitätsskala von 1 bis 5">
      {items.map((item) => {
        const label = item.label ?? item.prompt ?? item.id;
        const value = typeof draft[item.id] === 'number' ? draft[item.id] : undefined;
        const invalid = invalidItemIds.has(item.id);
        return (
          <fieldset
            className={`${styles.agreementItem ?? ''} ${
              invalid ? (styles.matrixRowInvalid ?? '') : ''
            }`.trim()}
            aria-describedby={invalid ? `${item.id}-error` : undefined}
            aria-invalid={invalid}
            key={item.id}
          >
            <legend>{label}</legend>
            <div className={`${styles.agreementOptions} ${styles.panasOptions}`.trim()}>
              {points5.map((point) => (
                <label className={styles.agreementOption} key={point}>
                  <input
                    type="radio"
                    name={item.id}
                    value={point}
                    checked={value === point}
                    required
                    aria-label={`${label}: ${point}, ${requiredAnchor(anchors, point)}`}
                    onChange={() => onChange(item.id, point)}
                  />
                  <span className={styles.agreementPoint} aria-hidden="true">
                    {point}
                  </span>
                  <span>{requiredAnchor(anchors, point)}</span>
                </label>
              ))}
            </div>
            <FieldError invalid={invalid} itemId={item.id} />
          </fieldset>
        );
      })}
    </div>
  );
}

function Agreement7Matrix({ items, draft, invalidItemIds, onChange }: MatrixProps<Agreement7Item>) {
  const anchors = instrumentRuntimeManifest.scales.agreement7.anchors;
  return (
    <div className={styles.agreementList} aria-label="Zustimmungsskala von 1 bis 7">
      {items.map((item) => {
        const value = typeof draft[item.id] === 'number' ? draft[item.id] : undefined;
        const invalid = invalidItemIds.has(item.id);
        return (
          <fieldset
            className={`${styles.agreementItem ?? ''} ${
              invalid ? (styles.matrixRowInvalid ?? '') : ''
            }`.trim()}
            aria-describedby={invalid ? `${item.id}-error` : undefined}
            aria-invalid={invalid}
            key={item.id}
          >
            <legend>{item.prompt ?? item.id}</legend>
            <div className={styles.agreementOptions}>
              {points7.map((point) => (
                <label className={styles.agreementOption} key={point}>
                  <input
                    type="radio"
                    name={item.id}
                    value={point}
                    checked={value === point}
                    required
                    aria-label={`${item.prompt ?? item.id}: ${point}, ${requiredAnchor(
                      anchors,
                      point,
                    )}`}
                    onChange={() => onChange(item.id, point)}
                  />
                  <span className={styles.agreementPoint} aria-hidden="true">
                    {point}
                  </span>
                  <span>{requiredAnchor(anchors, point)}</span>
                </label>
              ))}
            </div>
            <FieldError invalid={invalid} itemId={item.id} />
          </fieldset>
        );
      })}
    </div>
  );
}

function Confidence11Matrix({
  items,
  draft,
  invalidItemIds,
  onChange,
}: MatrixProps<Confidence11Item>) {
  const anchors = instrumentRuntimeManifest.scales.confidence11.anchors;
  return (
    <div
      className={`${styles.matrix ?? ''} ${styles.matrix11 ?? ''}`.trim()}
      aria-label="Zuversichtsskala von 0 bis 10"
    >
      <MatrixHeader accessibleLabel="Zuversichtsskala, Antwortwerte 0 bis 10">
        {points11.map((point) => (
          <MatrixNumber key={point} point={point} />
        ))}
      </MatrixHeader>
      {items.map((item) => {
        const value = typeof draft[item.id] === 'number' ? draft[item.id] : undefined;
        return (
          <MatrixRow key={item.id} item={item} invalid={invalidItemIds.has(item.id)}>
            {points11.map((point) => (
              <NativeRadioControl
                key={point}
                itemId={item.id}
                point={point}
                checked={value === point}
                accessibleName={`${item.prompt ?? item.id}: ${point} von 10${
                  !hasAnchor(anchors, point) ? '' : `, ${requiredAnchor(anchors, point)}`
                }`}
                onChange={(nextValue) => onChange(item.id, nextValue)}
              />
            ))}
          </MatrixRow>
        );
      })}
      <div
        className={`${styles.matrixAnchors} ${styles.confidenceAnchors}`}
        aria-label="Skalenanker"
      >
        <span className={`${styles.anchorLabel} ${styles.anchorLabelStart}`}>
          {anchors['0']}
        </span>
        <span className={`${styles.anchorLabel} ${styles.anchorLabelCenter}`}>
          {anchors['5']}
        </span>
        <span className={`${styles.anchorLabel} ${styles.anchorLabelEnd}`}>
          {anchors['10']}
        </span>
      </div>
    </div>
  );
}

function FullyLabelledScale7({
  item,
  value,
  invalid,
  onChange,
}: {
  readonly item: FullyLabelled7Item;
  readonly value: number | undefined;
  readonly invalid: boolean;
  readonly onChange: (value: number) => void;
}) {
  const anchors = instrumentRuntimeManifest.scales[item.scale].anchors;
  return (
    <fieldset
      className={`${styles.agreementItem ?? ''} ${
        invalid ? (styles.matrixRowInvalid ?? '') : ''
      }`.trim()}
      aria-describedby={invalid ? `${item.id}-error` : undefined}
      aria-invalid={invalid}
    >
      <legend>{item.prompt ?? item.id}</legend>
      <div className={styles.agreementOptions}>
        {points7.map((point) => (
          <label className={styles.agreementOption} key={point}>
            <input
              type="radio"
              name={item.id}
              value={point}
              checked={value === point}
              required
              aria-label={`${item.prompt ?? item.id}: ${point}, ${requiredAnchor(
                anchors,
                point,
              )}`}
              onChange={() => onChange(point)}
            />
            <span className={styles.agreementPoint} aria-hidden="true">
              {point}
            </span>
            <span>{requiredAnchor(anchors, point)}</span>
          </label>
        ))}
      </div>
      <FieldError invalid={invalid} itemId={item.id} />
    </fieldset>
  );
}

function UeqSemanticDifferential7({
  items,
  draft,
  invalidItemIds,
  onChange,
}: {
  readonly items: readonly SemanticDifferentialItem[];
  readonly draft: Draft;
  readonly invalidItemIds: ReadonlySet<string>;
  readonly onChange: (itemId: string, value: number) => void;
}) {
  const scale = instrumentRuntimeManifest.scales.ueqSemanticDifferential7;
  const points = Array.from({ length: scale.max - scale.min + 1 }, (_, index) => scale.min + index);

  return (
    <div className={styles.ueqMatrix} aria-label="Semantische Begriffspaare">
      {items.map((item) => {
        const invalid = invalidItemIds.has(item.id);
        const value = typeof draft[item.id] === 'number' ? draft[item.id] : undefined;
        return (
          <fieldset
            className={`${styles.ueqRow ?? ''} ${
              invalid ? (styles.matrixRowInvalid ?? '') : ''
            }`.trim()}
            aria-describedby={invalid ? `${item.id}-error` : undefined}
            aria-invalid={invalid}
            key={item.id}
          >
            <legend className={styles.visuallyHidden}>
              Position zwischen {item.left} und {item.right}
            </legend>
            <span className={styles.ueqTerm} aria-hidden="true">
              {item.left}
            </span>
            <div className={styles.ueqPoints}>
              {points.map((point) => (
                <NativeRadioControl
                  key={point}
                  itemId={item.id}
                  point={point}
                  checked={value === point}
                  accessibleName={`Position ${point} von 7 zwischen ${item.left} und ${item.right}`}
                  onChange={(nextValue) => onChange(item.id, nextValue)}
                />
              ))}
            </div>
            <span
              className={`${styles.ueqTerm ?? ''} ${styles.ueqTermRight ?? ''}`.trim()}
              aria-hidden="true"
            >
              {item.right}
            </span>
            <FieldError invalid={invalid} itemId={item.id} />
          </fieldset>
        );
      })}
    </div>
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
      <div className={styles.numberInputGroup}>
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
        <span>Minuten</span>
      </div>
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
        hasScale(item, 'durationAppropriateness7') ||
        hasScale(item, 'perceivedDuration7') ||
        hasScale(item, 'riskPresentation7')
      ) ? (
        <FullyLabelledScale7
          item={item}
          value={typeof value === 'number' ? value : undefined}
          invalid={invalid}
          onChange={onChange}
        />
      ) : null;
    case 'semanticDifferential':
      return null;
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

function hasScale<Scale extends ScaleItem['scale']>(
  item: QuestionnaireItem,
  scale: Scale,
): item is ScaleItem & { readonly scale: Scale } {
  return item.type === 'scale' && item.scale === scale;
}

function scaleItemsFrom<Scale extends ScaleItem['scale']>(
  items: readonly QuestionnaireItem[],
  startIndex: number,
  scale: Scale,
  limit: number,
): readonly (ScaleItem & { readonly scale: Scale })[] {
  const result: (ScaleItem & { readonly scale: Scale })[] = [];
  for (const item of items.slice(startIndex, startIndex + limit)) {
    if (!hasScale(item, scale)) break;
    result.push(item);
  }
  return result;
}

function semanticDifferentialItemsFrom(
  items: readonly QuestionnaireItem[],
  startIndex: number,
): readonly SemanticDifferentialItem[] {
  const result: SemanticDifferentialItem[] = [];
  for (const item of items.slice(startIndex)) {
    if (item.type !== 'semanticDifferential') break;
    result.push(item);
  }
  return result;
}

interface QuestionnaireFieldGroup {
  readonly key: string;
  readonly content: ReactNode;
}

function questionnaireSectionFieldGroups({
  items,
  draft,
  invalidItemIds,
  onChange,
}: {
  readonly items: readonly QuestionnaireItem[];
  readonly draft: Draft;
  readonly invalidItemIds: ReadonlySet<string>;
  readonly onChange: (itemId: string, value: InstrumentResponseValue | undefined) => void;
}): readonly QuestionnaireFieldGroup[] {
  const fieldGroups: QuestionnaireFieldGroup[] = [];
  let itemIndex = 0;

  while (itemIndex < items.length) {
    const item = items[itemIndex];
    if (item === undefined) break;

    if (item.type === 'semanticDifferential') {
      const matrixItems = semanticDifferentialItemsFrom(items, itemIndex);
      const key = `ueq:${matrixItems[0]?.id ?? item.id}`;
      fieldGroups.push({
        key,
        content: (
          <UeqSemanticDifferential7
            key={key}
            items={matrixItems}
            draft={draft}
            invalidItemIds={invalidItemIds}
            onChange={onChange}
          />
        ),
      });
      itemIndex += matrixItems.length;
      continue;
    }

    if (hasScale(item, 'panasIntensity5')) {
      const matrixItems = scaleItemsFrom(items, itemIndex, 'panasIntensity5', 5);
      const key = `panas:${matrixItems[0]?.id ?? item.id}`;
      fieldGroups.push({
        key,
        content: (
          <PanasIntensity5Matrix
            key={key}
            items={matrixItems}
            draft={draft}
            invalidItemIds={invalidItemIds}
            onChange={onChange}
          />
        ),
      });
      itemIndex += matrixItems.length;
      continue;
    }

    if (hasScale(item, 'agreement7')) {
      const matrixItems = scaleItemsFrom(items, itemIndex, 'agreement7', 5);
      const key = `agreement:${matrixItems[0]?.id ?? item.id}`;
      fieldGroups.push({
        key,
        content: (
          <Agreement7Matrix
            key={key}
            items={matrixItems}
            draft={draft}
            invalidItemIds={invalidItemIds}
            onChange={onChange}
          />
        ),
      });
      itemIndex += matrixItems.length;
      continue;
    }

    if (hasScale(item, 'confidence11')) {
      const matrixItems = scaleItemsFrom(items, itemIndex, 'confidence11', items.length);
      const key = `confidence:${matrixItems[0]?.id ?? item.id}`;
      fieldGroups.push({
        key,
        content: (
          <Confidence11Matrix
            key={key}
            items={matrixItems}
            draft={draft}
            invalidItemIds={invalidItemIds}
            onChange={onChange}
          />
        ),
      });
      itemIndex += matrixItems.length;
      continue;
    }

    fieldGroups.push({
      key: item.id,
      content: (
        <QuestionnaireItemField
          key={item.id}
          item={item}
          value={draft[item.id]}
          invalid={invalidItemIds.has(item.id)}
          onChange={(value) => onChange(item.id, value)}
        />
      ),
    });
    itemIndex += 1;
  }

  return fieldGroups;
}

export function QuestionnaireSectionForm<TInstrumentId extends QuestionnaireInstrumentId>({
  instrumentId,
  section,
  title,
  currentSection,
  sectionCount,
  sectionHeading,
  submitLabel,
  progressSteps,
  progressCurrent,
  progressStepNoun,
  initialSubmission,
  footer,
  onBack,
  onSubmit,
}: {
  readonly instrumentId: TInstrumentId;
  readonly section: QuestionnaireSection;
  readonly title: string;
  readonly currentSection: number;
  readonly sectionCount: number;
  readonly sectionHeading?: string;
  readonly submitLabel?: string;
  readonly progressSteps: readonly InstrumentProgressStep[];
  readonly progressCurrent?: number;
  readonly progressStepNoun?: string;
  readonly initialSubmission: InstrumentSubmissionRequest | null;
  readonly footer?: ReactNode;
  readonly onBack: (submission: InstrumentSubmissionFor<TInstrumentId>) => void;
  readonly onSubmit: (submission: InstrumentSubmissionFor<TInstrumentId>) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => draftFromSubmission(initialSubmission));
  const [invalidItemIds, setInvalidItemIds] = useState<ReadonlySet<string>>(new Set<string>());
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const headingId = `${instrumentId}-${section.id}-title`;
  const fieldGroups = questionnaireSectionFieldGroups({
    items: section.items,
    draft,
    invalidItemIds,
    onChange: updateDraft,
  });
  const normalizedProgressCurrent = progressCurrent ?? currentSection;

  function updateDraft(itemId: string, value: InstrumentResponseValue | undefined): void {
    setDraft((current) => ({ ...current, [itemId]: value }));
    setInvalidItemIds((current) => {
      if (!current.has(itemId)) return current;
      const next = new Set(current);
      next.delete(itemId);
      return next;
    });
  }

  function questionnaireSubmission(): InstrumentSubmissionFor<TInstrumentId> {
    return {
      instrumentId,
      sectionId: section.id,
      responses: section.items.map((item) => ({
        itemId: item.id,
        value: questionnaireValue(item, draft[item.id]),
      })),
    };
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const submission = questionnaireSubmission();
    const invalid = invalidSubmissionItems(submission);
    if (invalid !== null) {
      setInvalidItemIds(invalid);
      const firstInvalidItemId = invalid.values().next().value;
      if (typeof firstInvalidItemId === 'string') {
        formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalidItemId}"]`)?.focus();
      }
      return;
    }
    onSubmit(submission);
  }

  return (
    <section aria-labelledby={headingId}>
      <InstrumentHeader
        headingId={headingId}
        title={title}
        currentStep={currentSection}
        totalSteps={sectionCount}
        stepNoun={progressStepNoun ?? 'Abschnitt'}
        progressSteps={progressSteps}
        currentPage={currentSection}
        progressCurrent={normalizedProgressCurrent}
      />
      <div className={styles.instrumentCard}>
        <form className={styles.instrumentForm} ref={formRef} noValidate onSubmit={submit}>
          {sectionHeading === undefined ? null : (
            <h2 className={styles.instrumentSectionHeading}>{sectionHeading}</h2>
          )}
          {section.instruction === undefined ? null : (
            <div className={styles.sectionInstruction}>
              <FormInformationIcon />
              <p>{section.instruction}</p>
            </div>
          )}
          <div className={styles.instrumentFields}>
            {fieldGroups.map((fieldGroup) => (
              <div className={styles.instrumentFieldGroup} key={fieldGroup.key}>
                {fieldGroup.content}
              </div>
            ))}
            {invalidItemIds.size === 0 ? null : (
              <div className={styles.validationSummary} role="alert">
                Bitte prüfe die markierten Felder. Der Abschnitt wurde noch nicht abgegeben.
              </div>
            )}
          </div>
          <div
            className={`${styles.instrumentActions} ${
              currentSection === 1 ? styles.instrumentActionsForwardOnly : ''
            }`.trim()}
          >
            {footer}
            {currentSection > 1 ? (
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => onBack(questionnaireSubmission())}
              >
                <BackIcon />
                Zurück
              </button>
            ) : null}
            <button className={styles.button} type="submit">
              {submitLabel ?? 'Weiter'}
              <ForwardIcon />
            </button>
          </div>
        </form>
      </div>
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
  title,
  sectionHeading,
  submitLabel,
  progressSteps,
  progressCurrent,
  footer,
  onSubmit,
}: {
  readonly block: GuardrailBlock;
  readonly formId: GuardrailFormId;
  readonly title: string;
  readonly sectionHeading: string;
  readonly submitLabel: string;
  readonly progressSteps: readonly InstrumentProgressStep[];
  readonly progressCurrent: number;
  readonly footer?: ReactNode;
  readonly onSubmit: (submission: InstrumentSubmissionFor<'guardrail-v2'>) => void;
}) {
  const [draft, setDraft] = useState<Draft>({});
  const [invalidItemIds, setInvalidItemIds] = useState<ReadonlySet<string>>(new Set<string>());
  const formRef = useRef<HTMLFormElement>(null);
  const presentedItems: {
    readonly item: GuardrailItem;
    readonly options: readonly ChoiceOption[];
  }[] = [];

  for (const itemId of guardrailQuestionOrderForForm(block.id, formId)) {
    const item = block.items.find((candidate) => candidate.id === itemId);
    const options = item === undefined ? null : orderedGuardrailOptions(item, block.id, formId);
    if (item === undefined || options === null) {
      return (
        <section aria-labelledby="guardrail-configuration-error-title" role="alert">
          <h1 id="guardrail-configuration-error-title" tabIndex={-1} autoFocus>
            Abschlussfragen nicht verfügbar
          </h1>
          <p className={styles.errorCode}>Fehlercode: guardrail-presentation-invalid</p>
        </section>
      );
    }
    presentedItems.push({ item, options });
  }

  if (presentedItems.length !== block.items.length) {
    return (
      <section aria-labelledby="guardrail-configuration-error-title" role="alert">
        <h1 id="guardrail-configuration-error-title" tabIndex={-1} autoFocus>
          Abschlussfragen nicht verfügbar
        </h1>
        <p className={styles.errorCode}>Fehlercode: guardrail-question-order-invalid</p>
      </section>
    );
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
        formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalidItemId}"]`)?.focus();
      }
      return;
    }
    onSubmit(submission);
  }

  return (
    <section aria-labelledby="guardrail-title">
      <InstrumentHeader
        headingId="guardrail-title"
        title={title}
        currentStep={progressCurrent}
        totalSteps={progressSteps.length}
        stepNoun="Abschnitt"
        progressSteps={progressSteps}
        currentPage={1}
        progressCurrent={progressCurrent}
      />
      <div className={styles.instrumentCard}>
        <form className={styles.instrumentForm} ref={formRef} noValidate onSubmit={submit}>
          <h2 className={styles.instrumentSectionHeading}>{sectionHeading}</h2>
          <div className={styles.instrumentFields}>
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
          </div>
          <div className={styles.instrumentActions}>
            {footer}
            <button className={styles.button} type="submit">
              {submitLabel}
              <ForwardIcon />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
