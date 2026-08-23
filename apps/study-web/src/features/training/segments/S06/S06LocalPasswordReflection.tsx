import { s05Content, s06ConsequenceContent } from '@passwo/training-content';
import { type CSSProperties, type ReactNode, useState } from 'react';
import { NetworkSymbol } from '../../../../adapters/network/NetworkSymbolRegistry.js';
import {
  PasswordBlockText,
  PasswordBuildingBlocks,
  passwordSingleLineVisualStyleFor,
  passwordVisualStyleFor,
} from '../S05/PasswordBuildingBlocks.js';
import { PasswordCategoryIconStack } from '../S05/PasswordCategoryIcon.js';
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
  const groupLimitReached =
    reflection.contentGroups.length >= content.maxGroupCount;
  const canAddGroup =
    !groupLimitReached &&
    reflection.contentGroups.every(({ blockIds }) => blockIds.length > 0);
  const passwordTitle =
    reflection.accountId === 'campusgram'
      ? content.passwordLabel
      : content.passwordTitles[reflection.accountId];
  const passwordScaleStyle =
    reflection.mode === 'personal'
      ? passwordVisualStyleFor(reflection.fictionalPassword)
      : passwordSingleLineVisualStyleFor(
          reflection.fictionalPassword,
          reflection.blocks.length,
        );
  return (
    <section
      className={styles.reflection}
      aria-label={`${content.passwordLabel}: ${reflection.accountLabel}`}
      data-account-id={reflection.accountId}
      data-interactive={interactive || undefined}
    >
      <div className={styles.passwordVisualization}>
        <h2 className={styles.title}>
          <span aria-hidden="true">
            <NetworkSymbol symbolId={reflection.accountId} />
          </span>
          {passwordTitle}
        </h2>
        <div
          className={styles.password}
          data-mode={reflection.mode}
          data-has-category-icons={
            reflection.blocks.some(({ findings }) => findings.length > 0) || undefined
          }
          aria-label={reflection.fictionalPassword}
          style={passwordScaleStyle}
        >
          {reflection.mode === 'personal' ? (
            <div className={styles.personalPassword}>
              <PasswordBuildingBlocks
                value={reflection.fictionalPassword}
                parts={[...reflection.fictionalPassword]}
                display="decomposed"
                appearance="analysis"
                continuous
                animate
                categoryIds={[...reflection.fictionalPassword].map(() => [])}
                rangeSelection={{
                  candidates: reflection.personalCandidates,
                  onCreate: onPersonalCreate,
                  onRemove: onPersonalRemove,
                  status: s05Content.componentStrategy.personalDetails.selectionStatus,
                }}
                ariaLabel={content.personalSelectionLabel}
              />
              <button
                type="button"
                className={styles.applyPersonal}
                onClick={() => onModeChange('groups')}
              >
                {content.personalApply}
              </button>
            </div>
          ) : (() => {
            const rendered: ReactNode[] = [];
            const tokenFor = (index: number): ReactNode => {
              const block = reflection.blocks[index];
              if (block === undefined) return null;
              const previousBlock = reflection.blocks[index - 1];
              const nextBlock = reflection.blocks[index + 1];
              const groupIndex = reflection.contentGroups.findIndex(({ blockIds }) =>
                blockIds.includes(block.id),
              );
              const groupSelected = groupIndex >= 0;
              const incomingLinkActive =
                previousBlock !== undefined &&
                structureLinkExists(reflection, previousBlock.id, block.id);
              const outgoingLinkActive =
                nextBlock !== undefined && structureLinkExists(reflection, block.id, nextBlock.id);
              const structureConnected = incomingLinkActive || outgoingLinkActive;
              const groupStyle: GroupColorStyle | undefined =
                groupIndex < 0
                  ? undefined
                  : {
                      '--s06-reflection-group-color':
                        structureGroupColor(groupIndex),
                    };
              return (
                <span className={styles.blockFrame} key={block.id}>
                  {block.repetitionCount === null ? null : (
                    <span
                      className={styles.repetitionCount}
                      aria-label={`${block.repetitionCount}-mal`}
                    >
                      ×{block.repetitionCount}
                    </span>
                  )}
                  <button
                    type="button"
                    className={styles.block}
                    style={groupStyle}
                    data-repetition={block.repeated || undefined}
                    data-group-selected={groupSelected || undefined}
                    data-structure-selected={structureConnected || undefined}
                    aria-pressed={
                      reflection.mode === 'groups' ? groupSelected : outgoingLinkActive
                    }
                    disabled={
                      !interactive || (reflection.mode === 'structure' && nextBlock === undefined)
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
      </div>
      <footer className={styles.actions}>
        {interactive ? (
          <div className={styles.modes}>
            <strong>{content.modeLabel}</strong>
            <div className={styles.modeControls}>
              <div className={styles.primaryModes}>
                <div className={styles.groupControl}>
                  <div
                    className={styles.groupList}
                    data-group-count={reflection.contentGroups.length}
                  >
                    {reflection.contentGroups.map((group, groupIndex) => {
                      const groupStyle: GroupColorStyle = {
                        '--s06-reflection-group-color':
                          structureGroupColor(groupIndex),
                      };
                      return (
                        <div className={styles.groupEntry} key={group.id}>
                          <button
                            type="button"
                            className={styles.groupButton}
                            style={groupStyle}
                            data-active={
                              (reflection.mode === 'groups' &&
                                reflection.activeContentGroupId === group.id) || undefined
                            }
                            aria-pressed={
                              reflection.mode === 'groups' &&
                              reflection.activeContentGroupId === group.id
                            }
                            onClick={() => onGroupSelect(group.id)}
                          >
                            {content.groupLabel} {structureGroupLetter(groupIndex)}
                          </button>
                          {groupIndex === 0 ? null : (
                            <button
                              type="button"
                              className={styles.deleteGroup}
                              aria-label={
                                `${s05Content.structure.reflection.deleteGroup} ` +
                                `${content.groupLabel} ${structureGroupLetter(groupIndex)}`
                              }
                              onClick={() => onGroupRemove(group.id)}
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 7h16" />
                                <path d="M9 7V4h6v3" />
                                <path d="M7 7l1 13h8l1-13" />
                                <path d="M10 11v5" />
                                <path d="M14 11v5" />
                              </svg>
                              <small>{s05Content.structure.reflection.deleteGroup}</small>
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {groupLimitReached ? (
                      <span className={styles.groupLimit}>{content.maxGroups}</span>
                    ) : (
                      <button
                        type="button"
                        className={styles.addGroup}
                        aria-label={content.newGroup}
                        disabled={!canAddGroup}
                        onClick={onGroupAdd}
                      >
                        <span aria-hidden="true">+</span>
                        <small>{content.newGroup}</small>
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  data-active={reflection.mode === 'structure' || undefined}
                  aria-pressed={reflection.mode === 'structure'}
                  disabled={reflection.blocks.length < 2}
                  onClick={() => onModeChange('structure')}
                >
                  {content.structureMode}
                </button>
              </div>
              <button
                type="button"
                className={styles.personalMode}
                data-active={reflection.mode === 'personal' || undefined}
                aria-pressed={reflection.mode === 'personal'}
                onClick={() => onModeChange('personal')}
              >
                {content.personalMode}
              </button>
            </div>
            <button type="button" className={styles.finish} onClick={onFinish}>
              {s06ConsequenceContent.page.finish}
            </button>
          </div>
        ) : null}
      </footer>
    </section>
  );
}
