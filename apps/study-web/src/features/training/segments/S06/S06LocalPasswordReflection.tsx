import { s05Content, s06ConsequenceContent } from '@passwo/training-content';
import { type CSSProperties, type ReactNode, useState } from 'react';
import scaleWarningAsset from '../../../../assets/s05/scale-warning.svg';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import {
  PasswordBlockText,
  passwordSingleLineVisualStyleFor,
  usePasswordRangeSelection,
} from '../S05/PasswordBuildingBlocks.js';
import {
  PasswordCategoryIcon,
  PasswordCategoryIconStack,
} from '../S05/PasswordCategoryIcon.js';
import { structureGroupColor, structureGroupLetter } from '../S05/StructureGroupPalette.js';
import type {
  S06LocalReflectionMode,
  S06LocalReflectionSnapshot,
} from './S06ConsequenceController.js';
import styles from './S06LocalPasswordReflection.module.css';

interface GroupColorStyle extends CSSProperties {
  readonly '--s06-reflection-group-color': string;
}

function structureLinkExists(
  reflection: S06LocalReflectionSnapshot,
  fromBlockId: string,
  toBlockId: string,
): boolean {
  return reflection.structureLinks.some(
    (link) => link.fromBlockId === fromBlockId && link.toBlockId === toBlockId,
  );
}

function StructureLinkArrow({
  active = false,
  preview = false,
  separator = false,
}: {
  readonly active?: boolean;
  readonly preview?: boolean;
  readonly separator?: boolean;
}) {
  return (
    <span
      className={styles.structureGap}
      data-active={active || undefined}
      data-preview={preview || undefined}
      data-separator={separator || undefined}
      aria-hidden="true"
    >
      <span className={styles.structureArrow} />
    </span>
  );
}

function StructureModeIcon() {
  return (
    <svg viewBox="0 0 44 28" aria-hidden="true">
      <rect x="2" y="7" width="13" height="14" rx="3" />
      <path d="M18 14h9" />
      <path d="m24 10 4 4-4 4" />
      <rect x="31" y="7" width="11" height="14" rx="3" />
    </svg>
  );
}

export function S06LocalPasswordReflection({
  reflection,
  interactive,
  onModeChange,
  onGroupSelect,
  onGroupAdd,
  onGroupRemove,
  onBlockToggle,
  onPersonalCreate,
  onPersonalRemove,
  onFinish,
}: {
  readonly reflection: S06LocalReflectionSnapshot;
  readonly interactive: boolean;
  readonly onModeChange: (mode: S06LocalReflectionMode) => void;
  readonly onGroupSelect: (groupId: string) => void;
  readonly onGroupAdd: () => void;
  readonly onGroupRemove: (groupId: string) => void;
  readonly onBlockToggle: (blockId: string) => void;
  readonly onPersonalCreate: (start: number, end: number) => boolean;
  readonly onPersonalRemove: (candidateId: string) => void;
  readonly onFinish: () => void;
}) {
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const content = s06ConsequenceContent.page.localReflection;
  const modesAvailable = reflection.blocks.length >= 2;
  const relationshipUnavailableHintId =
    `s06-${reflection.accountId}-relationship-unavailable-hint`;
  const structureUnavailableHintId = `s06-${reflection.accountId}-structure-unavailable-hint`;
  const groupLimitReached =
    reflection.contentGroups.length >= content.maxGroupCount;
  const canAddGroup =
    !groupLimitReached &&
    reflection.contentGroups.every(({ blockIds }) => blockIds.length >= 2);
  const activeGroupIndex = Math.max(
    0,
    reflection.contentGroups.findIndex(({ id }) => id === reflection.activeContentGroupId),
  );
  const activeGroupStyle: GroupColorStyle = {
    '--s06-reflection-group-color': structureGroupColor(activeGroupIndex),
  };
  const nextGroupStyle: GroupColorStyle = {
    '--s06-reflection-group-color': structureGroupColor(reflection.contentGroups.length),
  };
  const personalRangeSelection = usePasswordRangeSelection(
    reflection.fictionalPassword,
    reflection.mode === 'personal'
      ? {
          candidates: reflection.personalCandidates,
          onCreate: onPersonalCreate,
          onRemove: onPersonalRemove,
          status: s05Content.componentStrategy.personalDetails.selectionStatus,
        }
      : undefined,
  );
  const passwordTitle =
    reflection.accountId === 'campusgram'
      ? content.passwordLabel
      : content.passwordTitles[reflection.accountId];
  const passwordScaleStyle = passwordSingleLineVisualStyleFor(
    reflection.fictionalPassword,
    reflection.blocks.length,
  );
  return (
    <section
      className={styles.reflection}
      aria-label={`${content.passwordLabel}: ${reflection.accountLabel}`}
      data-account-id={reflection.accountId}
      data-interactive={interactive || undefined}
      data-personal-marker-cursor-active={reflection.mode === 'personal' || undefined}
    >
      <div className={styles.passwordVisualization}>
        <h2 className={styles.title}>
          <span aria-hidden="true">
            <NetworkSymbol symbolId={reflection.accountId} />
          </span>
          <span className={styles.titleText}>{passwordTitle}</span>
        </h2>
        <div
          className={styles.password}
          data-mode={reflection.mode}
          data-few-blocks={reflection.blocks.length <= 3 || undefined}
          data-has-category-icons={
            reflection.blocks.some(({ findings }) => findings.length > 0) || undefined
          }
          data-range-selection-surface={reflection.mode === 'personal' || undefined}
          data-range-selectable={reflection.mode === 'personal' || undefined}
          data-selecting={personalRangeSelection.isSelecting || undefined}
          aria-label={
            reflection.mode === 'personal'
              ? content.personalSelectionLabel
              : reflection.fictionalPassword
          }
          style={passwordScaleStyle}
          onPointerMove={personalRangeSelection.handlePointerMove}
          onPointerUp={personalRangeSelection.handlePointerEnd}
          onPointerCancel={personalRangeSelection.handlePointerCancel}
        >
          {(() => {
            const rendered: ReactNode[] = [];
            const tokenFor = (index: number): ReactNode => {
              const block = reflection.blocks[index];
              if (block === undefined) return null;
              const previousBlock = reflection.blocks[index - 1];
              const nextBlock = reflection.blocks[index + 1];
              const groupIndex = reflection.contentGroups.findIndex(({ blockIds }) =>
                blockIds.includes(block.id),
              );
              const groupSelected = modesAvailable && groupIndex >= 0;
              const groupComplete =
                groupSelected &&
                (reflection.contentGroups[groupIndex]?.blockIds.length ?? 0) >= 2;
              const groupPreview = groupSelected && !groupComplete;
              const incomingLinkActive =
                previousBlock !== undefined &&
                structureLinkExists(reflection, previousBlock.id, block.id);
              const outgoingLinkActive =
                nextBlock !== undefined && structureLinkExists(reflection, block.id, nextBlock.id);
              const structureConnected =
                modesAvailable && (incomingLinkActive || outgoingLinkActive);
              const groupStyle: GroupColorStyle | undefined =
                groupIndex < 0
                  ? undefined
                  : {
                      '--s06-reflection-group-color':
                        structureGroupColor(groupIndex),
                    };
              return (
                <span className={styles.blockFrame} style={groupStyle} key={block.id}>
                  {block.repetitionCount === null ? null : (
                    <span
                      className={styles.repetitionCount}
                      aria-label={`${block.repetitionCount}-mal`}
                    >
                      ×{block.repetitionCount}
                    </span>
                  )}
                  {reflection.mode === 'personal' ? (
                    <span
                      className={styles.block}
                      style={groupStyle}
                      data-repetition={block.repeated || undefined}
                      data-group-selected={groupComplete || undefined}
                      data-group-preview={groupPreview || undefined}
                      data-structure-selected={structureConnected || undefined}
                    >
                      {personalRangeSelection.characters.flatMap(
                        (character, characterIndex) =>
                          character.start >= block.start && character.end <= block.end
                            ? [personalRangeSelection.renderCharacter(characterIndex)]
                            : [],
                      )}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={styles.block}
                      style={groupStyle}
                      data-repetition={block.repeated || undefined}
                      data-group-selected={groupComplete || undefined}
                      data-group-preview={groupPreview || undefined}
                      data-structure-selected={structureConnected || undefined}
                      aria-pressed={
                        reflection.mode === 'groups' ? groupSelected : outgoingLinkActive
                      }
                      disabled={
                        !interactive ||
                        ((reflection.mode === 'groups' || reflection.mode === 'structure') &&
                          !modesAvailable) ||
                        (reflection.mode === 'structure' && nextBlock === undefined)
                      }
                      onClick={() => onBlockToggle(block.id)}
                      onMouseEnter={() =>
                        setHoveredBlockId(reflection.mode === 'structure' ? block.id : null)
                      }
                      onMouseLeave={() => setHoveredBlockId(null)}
                      onFocus={() =>
                        setHoveredBlockId(reflection.mode === 'structure' ? block.id : null)
                      }
                      onBlur={() => setHoveredBlockId(null)}
                    >
                      <PasswordBlockText
                        value={block.value}
                        start={block.start}
                        personalHighlightRanges={reflection.personalCandidates}
                      />
                    </button>
                  )}
                  <PasswordCategoryIconStack findings={block.findings} />
                </span>
              );
            };

            let index = 0;
            while (index < reflection.blocks.length) {
              const block = reflection.blocks[index];
              const nextBlock = reflection.blocks[index + 1];
              if (
                block !== undefined &&
                nextBlock !== undefined &&
                structureLinkExists(reflection, block.id, nextBlock.id)
              ) {
                const startIndex = index;
                let endIndex = index + 1;
                while (endIndex < reflection.blocks.length - 1) {
                  const current = reflection.blocks[endIndex];
                  const following = reflection.blocks[endIndex + 1];
                  if (
                    current === undefined ||
                    following === undefined ||
                    !structureLinkExists(reflection, current.id, following.id)
                  ) {
                    break;
                  }
                  endIndex += 1;
                }
                const runChildren: ReactNode[] = [];
                for (let runIndex = startIndex; runIndex <= endIndex; runIndex += 1) {
                  const runBlock = reflection.blocks[runIndex];
                  if (runBlock === undefined) continue;
                  runChildren.push(tokenFor(runIndex));
                  if (runIndex < endIndex) {
                    runChildren.push(<StructureLinkArrow active key={`link-${runBlock.id}`} />);
                  }
                }
                rendered.push(
                  <span className={styles.structureRun} key={`run-${block.id}`}>
                    {runChildren}
                  </span>,
                );
                const runEndBlock = reflection.blocks[endIndex];
                if (runEndBlock !== undefined && endIndex < reflection.blocks.length - 1) {
                  rendered.push(
                    <StructureLinkArrow
                      separator
                      preview={
                        reflection.mode === 'structure' && hoveredBlockId === runEndBlock.id
                      }
                      key={`separator-${runEndBlock.id}`}
                    />,
                  );
                }
                index = endIndex + 1;
                continue;
              }
              if (block !== undefined) rendered.push(tokenFor(index));
              if (block !== undefined && nextBlock !== undefined) {
                rendered.push(
                  <StructureLinkArrow
                    preview={reflection.mode === 'structure' && hoveredBlockId === block.id}
                    key={`gap-${block.id}`}
                  />,
                );
              }
              index += 1;
            }
            return rendered;
          })()}
        </div>
        {reflection.mode === 'personal' ? (
          <span className={styles.selectionStatus} aria-live="polite">
            {personalRangeSelection.selectionStatus}
          </span>
        ) : null}
      </div>
      <footer className={styles.actions}>
        {interactive ? (
          <div className={styles.actionRow}>
            <div
              className={styles.modeControls}
              role="group"
              aria-label={content.modeLabel}
              data-active-mode={reflection.mode}
            >
              <div className={styles.relationshipControl}>
                <button
                  type="button"
                  className={styles.relationshipMode}
                  style={activeGroupStyle}
                  data-active={reflection.mode === 'groups' || undefined}
                  data-unavailable={!modesAvailable || undefined}
                  aria-pressed={reflection.mode === 'groups'}
                  aria-disabled={!modesAvailable || undefined}
                  aria-describedby={modesAvailable ? undefined : relationshipUnavailableHintId}
                  onClick={() => onModeChange('groups')}
                >
                  {!modesAvailable ? <img src={scaleWarningAsset} alt="" /> : null}
                  <span className={styles.modeLabel}>{content.groupLabel}</span>
                  {!modesAvailable ? (
                    <span
                      className={styles.modeUnavailableHint}
                      id={relationshipUnavailableHintId}
                      role="tooltip"
                    >
                      {content.requiresMultipleComponents}
                    </span>
                  ) : null}
                </button>
                {!modesAvailable ? null : (
                  <div className={styles.groupPalette}>
                    {reflection.contentGroups.map((group, groupIndex) => {
                      const groupStyle: GroupColorStyle = {
                        '--s06-reflection-group-color': structureGroupColor(groupIndex),
                      };
                      const groupName =
                        `${content.groupLabel} ${structureGroupLetter(groupIndex)}`;
                      return (
                        <div
                          className={styles.groupEntry}
                          style={groupStyle}
                          data-slot={groupIndex}
                          data-active={
                            (reflection.mode === 'groups' &&
                              reflection.activeContentGroupId === group.id) || undefined
                          }
                          key={group.id}
                        >
                          <button
                            type="button"
                            className={styles.groupButton}
                            data-active={
                              (reflection.mode === 'groups' &&
                                reflection.activeContentGroupId === group.id) || undefined
                            }
                            aria-label={groupName}
                            aria-pressed={
                              reflection.mode === 'groups' &&
                              reflection.activeContentGroupId === group.id
                            }
                            onClick={() => onGroupSelect(group.id)}
                          >
                            {structureGroupLetter(groupIndex)}
                          </button>
                          {groupIndex === 0 ? null : (
                            <button
                              type="button"
                              className={styles.deleteGroup}
                              aria-label={
                                `${s05Content.structure.reflection.deleteGroup} ${groupName}`
                              }
                              onClick={() => onGroupRemove(group.id)}
                            >
                              <span aria-hidden="true">×</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {groupLimitReached ? null : (
                      <div
                        className={styles.groupEntry}
                        style={nextGroupStyle}
                        data-slot={reflection.contentGroups.length}
                      >
                        <button
                          type="button"
                          className={styles.addGroup}
                          aria-label={content.newGroup}
                          disabled={!canAddGroup}
                          onClick={onGroupAdd}
                        >
                          <span aria-hidden="true">+</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                className={styles.structureMode}
                data-active={reflection.mode === 'structure' || undefined}
                data-unavailable={!modesAvailable || undefined}
                aria-pressed={reflection.mode === 'structure'}
                aria-disabled={!modesAvailable || undefined}
                aria-describedby={modesAvailable ? undefined : structureUnavailableHintId}
                onClick={() => onModeChange('structure')}
              >
                {modesAvailable ? <StructureModeIcon /> : <img src={scaleWarningAsset} alt="" />}
                <span className={styles.modeLabel}>{content.structureMode}</span>
                {!modesAvailable ? (
                  <span
                    className={styles.modeUnavailableHint}
                    id={structureUnavailableHintId}
                    role="tooltip"
                  >
                    {content.requiresMultipleComponents}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className={styles.personalMode}
                data-active={reflection.mode === 'personal' || undefined}
                aria-pressed={reflection.mode === 'personal'}
                onClick={() => onModeChange('personal')}
              >
                <span className={styles.personalModeIcon} aria-hidden="true">
                  <PasswordCategoryIcon categoryId="personal-details" decorative />
                </span>
                <span className={styles.modeLabel}>{content.personalMode}</span>
              </button>
            </div>
            <button
              type="button"
              className={styles.finish}
              onClick={onFinish}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.5 2.5L16 9" />
              </svg>
              <span>{s06ConsequenceContent.page.finish}</span>
            </button>
          </div>
        ) : null}
      </footer>
    </section>
  );
}
