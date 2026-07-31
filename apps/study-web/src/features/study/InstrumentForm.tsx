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
import { type FormEvent, type ReactNode, useRef, useState } from 'react';
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
type Agreement7Item = ScaleItem & { readonly scale: 'agreement7' };
type Confidence11Item = ScaleItem & { readonly scale: 'confidence11' };
type Familiarity5Item = ScaleItem & { readonly scale: 'familiarity5' };
type EmotionIntensity5Item = ScaleItem & { readonly scale: 'intensity5' };
type DurationAppropriateness7Item = ScaleItem & {
  readonly scale: 'durationAppropriateness7';
};
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

function requiredAnchor(
  anchors: Readonly<Record<string, string>>,
  point: number,
): string {
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
      className={`${styles.matrixRow ?? ''} ${invalid ? styles.matrixRowInvalid ?? '' : ''}`.trim()}
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

function SharedAnchors({ children }: { readonly children: ReactNode }) {
  return (
    <div className={styles.matrixAnchors} aria-label="Skalenanker">
      <span className={styles.matrixHeaderSpacer} aria-hidden="true" />
      {children}
    </div>
  );
}

function AnchorLabel({ label }: { readonly label: string }) {
  return <span className={styles.anchorLabel}>{label}</span>;
}

function MatrixNumber({ point }: { readonly point: number }) {
  return (
    <span className={styles.matrixNumber} aria-hidden="true">
      {point}
    </span>
  );
}

function MatrixHeaderLabel({
  point,
  label,
}: {
  readonly point: number;
  readonly label: string;
}) {
  return (
    <span className={styles.matrixHeaderLabel} aria-hidden="true">
      <span className={styles.matrixNumber}>{point}</span>
      <span>{label}</span>
    </span>
  );
}

function Agreement7Matrix({
  items,
  draft,
  invalidItemIds,
  onChange,
}: MatrixProps<Agreement7Item>) {
  const anchors = instrumentRuntimeManifest.scales.agreement7.anchors;
  return (
    <div
      className={`${styles.matrix ?? ''} ${styles.matrix7 ?? ''}`.trim()}
      aria-label="Zustimmungsskala von 1 bis 7"
    >
      <MatrixHeader accessibleLabel="Antwortwerte 1 bis 7">
        {points7.map((point) => <MatrixNumber key={point} point={point} />)}
      </MatrixHeader>
      {items.map((item) => {
        const value = typeof draft[item.id] === 'number' ? draft[item.id] : undefined;
        return (
          <MatrixRow key={item.id} item={item} invalid={invalidItemIds.has(item.id)}>
            {points7.map((point) => (
              <NativeRadioControl
                key={point}
                itemId={item.id}
                point={point}
                checked={value === point}
                accessibleName={`${item.prompt ?? item.id}: ${point}, ${requiredAnchor(
                  anchors,
                  point,
                )}`}
                onChange={(nextValue) => onChange(item.id, nextValue)}
              />
            ))}
          </MatrixRow>
        );
      })}
      <SharedAnchors>
        <AnchorLabel label={anchors['1']} />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <AnchorLabel label={anchors['4']} />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <AnchorLabel label={anchors['7']} />
      </SharedAnchors>
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
      aria-label="Sicherheitsskala von 0 bis 10"
    >
      <MatrixHeader accessibleLabel="Antwortwerte 0 bis 10">
        {points11.map((point) => <MatrixNumber key={point} point={point} />)}
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
                  !hasAnchor(anchors, point)
                    ? ''
                    : `, ${requiredAnchor(anchors, point)}`
                }`}
                onChange={(nextValue) => onChange(item.id, nextValue)}
              />
            ))}
          </MatrixRow>
        );
      })}
      <SharedAnchors>
        <AnchorLabel label={anchors['0']} />
        {points11.slice(1, 5).map((point) => <span key={point} aria-hidden="true" />)}
        <AnchorLabel label={anchors['5']} />
        {points11.slice(6, 10).map((point) => <span key={point} aria-hidden="true" />)}
        <AnchorLabel label={anchors['10']} />
      </SharedAnchors>
    </div>
  );
}

function Familiarity5Matrix({
  items,
  draft,
  invalidItemIds,
  onChange,
}: MatrixProps<Familiarity5Item>) {
  const anchors = instrumentRuntimeManifest.scales.familiarity5.anchors;
  const instruction = items[0]?.instruction;
  return (
    <div className={styles.matrixGroup}>
      {instruction === undefined ? null : (
        <p className={styles.matrixInstruction}>{instruction}</p>
      )}
      <div
        className={`${styles.matrix ?? ''} ${styles.matrix5 ?? ''}`.trim()}
        aria-label="Vertrautheitsskala von 1 bis 5"
      >
        <MatrixHeader accessibleLabel="Antwortwerte 1 bis 5">
          {points5.map((point) => (
            <MatrixHeaderLabel
              key={point}
              point={point}
              label={requiredAnchor(anchors, point)}
            />
          ))}
        </MatrixHeader>
        {items.map((item) => {
          const value = typeof draft[item.id] === 'number' ? draft[item.id] : undefined;
          return (
            <MatrixRow key={item.id} item={item} invalid={invalidItemIds.has(item.id)}>
              {points5.map((point) => (
                <NativeRadioControl
                  key={point}
                  itemId={item.id}
                  point={point}
                  checked={value === point}
                  accessibleName={`${item.label ?? item.prompt ?? item.id}: ${point}, ${
                    requiredAnchor(anchors, point)
                  }`}
                  onChange={(nextValue) => onChange(item.id, nextValue)}
                />
              ))}
            </MatrixRow>
          );
        })}
      </div>
    </div>
  );
}

function EmotionIntensity5Matrix({
  items,
  draft,
  invalidItemIds,
  onChange,
}: MatrixProps<EmotionIntensity5Item>) {
  const anchors = instrumentRuntimeManifest.scales.intensity5.anchors;
  return (
    <div
      className={`${styles.matrix ?? ''} ${styles.matrix5 ?? ''}`.trim()}
      aria-label="Emotionsintensität von 1 bis 5"
    >
      <MatrixHeader accessibleLabel="Antwortwerte 1 bis 5">
        {points5.map((point) => (
          <MatrixHeaderLabel
            key={point}
            point={point}
            label={requiredAnchor(anchors, point)}
          />
        ))}
      </MatrixHeader>
      {items.map((item) => {
        const value = typeof draft[item.id] === 'number' ? draft[item.id] : undefined;
        return (
          <MatrixRow key={item.id} item={item} invalid={invalidItemIds.has(item.id)}>
            {points5.map((point) => (
              <NativeRadioControl
                key={point}
                itemId={item.id}
                point={point}
                checked={value === point}
                accessibleName={`${item.label ?? item.id}: ${point}, ${requiredAnchor(
                  anchors,
                  point,
                )}`}
                onChange={(nextValue) => onChange(item.id, nextValue)}
              />
            ))}
          </MatrixRow>
        );
      })}
    </div>
  );
}

function DurationAppropriateness7({
  item,
  value,
  invalid,
  onChange,
}: {
  readonly item: DurationAppropriateness7Item;
  readonly value: number | undefined;
  readonly invalid: boolean;
  readonly onChange: (value: number) => void;
}) {
  const anchors = instrumentRuntimeManifest.scales.durationAppropriateness7.anchors;
  return (
    <div
      className={`${styles.matrix ?? ''} ${styles.matrix7 ?? ''}`.trim()}
      aria-label="Angemessenheit der Dauer"
    >
      <MatrixHeader accessibleLabel="Antwortwerte 1 bis 7">
        {points7.map((point) => <MatrixNumber key={point} point={point} />)}
      </MatrixHeader>
      <MatrixRow item={item} invalid={invalid}>
        {points7.map((point) => (
          <NativeRadioControl
            key={point}
            itemId={item.id}
            point={point}
            checked={value === point}
            accessibleName={`${item.prompt ?? item.id}: ${point} von 7${
              !hasAnchor(anchors, point) ? '' : `, ${requiredAnchor(anchors, point)}`
            }`}
            onChange={onChange}
          />
        ))}
      </MatrixRow>
      <SharedAnchors>
        <AnchorLabel label={anchors['1']} />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <AnchorLabel label={anchors['4']} />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <AnchorLabel label={anchors['7']} />
      </SharedAnchors>
    </div>
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
  const points = Array.from(
    { length: scale.max - scale.min + 1 },
    (_, index) => scale.min + index,
  );

  return (
    <div className={styles.ueqMatrix} aria-label="UEQ-S Begriffspaare">
      {items.map((item) => {
        const invalid = invalidItemIds.has(item.id);
        const value = typeof draft[item.id] === 'number' ? draft[item.id] : undefined;
        return (
          <fieldset
            className={`${styles.ueqRow ?? ''} ${
              invalid ? styles.matrixRowInvalid ?? '' : ''
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
            <span className={`${styles.ueqTerm ?? ''} ${styles.ueqTermRight ?? ''}`.trim()}>
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
      return hasScale(item, 'durationAppropriateness7') ? (
        <DurationAppropriateness7
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

function QuestionnaireSectionFields({
  items,
  draft,
  invalidItemIds,
  onChange,
}: {
  readonly items: readonly QuestionnaireItem[];
  readonly draft: Draft;
  readonly invalidItemIds: ReadonlySet<string>;
  readonly onChange: (itemId: string, value: InstrumentResponseValue | undefined) => void;
}) {
  const fields = [];
  let itemIndex = 0;

  while (itemIndex < items.length) {
    const item = items[itemIndex];
    if (item === undefined) break;

    if (item.type === 'semanticDifferential') {
      const matrixItems = semanticDifferentialItemsFrom(items, itemIndex);
      fields.push(
        <UeqSemanticDifferential7
          key={`ueq:${matrixItems[0]?.id ?? item.id}`}
          items={matrixItems}
          draft={draft}
          invalidItemIds={invalidItemIds}
          onChange={onChange}
        />,
      );
      itemIndex += matrixItems.length;
      continue;
    }

    if (hasScale(item, 'agreement7')) {
      const matrixItems = scaleItemsFrom(items, itemIndex, 'agreement7', 5);
      fields.push(
        <Agreement7Matrix
          key={`agreement:${matrixItems[0]?.id ?? item.id}`}
          items={matrixItems}
          draft={draft}
          invalidItemIds={invalidItemIds}
          onChange={onChange}
        />,
      );
      itemIndex += matrixItems.length;
      continue;
    }

    if (hasScale(item, 'confidence11')) {
      const matrixItems = scaleItemsFrom(items, itemIndex, 'confidence11', items.length);
      fields.push(
        <Confidence11Matrix
          key={`confidence:${matrixItems[0]?.id ?? item.id}`}
          items={matrixItems}
          draft={draft}
          invalidItemIds={invalidItemIds}
          onChange={onChange}
        />,
      );
      itemIndex += matrixItems.length;
      continue;
    }

    if (hasScale(item, 'familiarity5')) {
      const matrixItems = scaleItemsFrom(items, itemIndex, 'familiarity5', items.length);
      fields.push(
        <Familiarity5Matrix
          key={`familiarity:${matrixItems[0]?.id ?? item.id}`}
          items={matrixItems}
          draft={draft}
          invalidItemIds={invalidItemIds}
          onChange={onChange}
        />,
      );
      itemIndex += matrixItems.length;
      continue;
    }

    if (hasScale(item, 'intensity5')) {
      const matrixItems = scaleItemsFrom(items, itemIndex, 'intensity5', items.length);
      fields.push(
        <EmotionIntensity5Matrix
          key={`emotion:${matrixItems[0]?.id ?? item.id}`}
          items={matrixItems}
          draft={draft}
          invalidItemIds={invalidItemIds}
          onChange={onChange}
        />,
      );
      itemIndex += matrixItems.length;
      continue;
    }

    fields.push(
      <QuestionnaireItemField
        key={item.id}
        item={item}
        value={draft[item.id]}
        invalid={invalidItemIds.has(item.id)}
        onChange={(value) => onChange(item.id, value)}
      />,
    );
    itemIndex += 1;
  }

  return fields;
}

export function QuestionnaireSectionForm<
  TInstrumentId extends QuestionnaireInstrumentId,
>({
  instrumentId,
  section,
  title,
  progressLabel,
  submitLabel,
  onSubmit,
}: {
  readonly instrumentId: TInstrumentId;
  readonly section: QuestionnaireSection;
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
      <h1 id={headingId} tabIndex={-1} autoFocus>
        {title}
      </h1>
      <p className={styles.progress}>{progressLabel}</p>
      {section.instruction === undefined ? null : (
        <p className={styles.sectionInstruction}>{section.instruction}</p>
      )}
      <form className={styles.instrumentForm} ref={formRef} noValidate onSubmit={submit}>
        <QuestionnaireSectionFields
          items={section.items}
          draft={draft}
          invalidItemIds={invalidItemIds}
          onChange={updateDraft}
        />
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
