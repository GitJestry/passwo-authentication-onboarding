import { getS05DesignLabFixture, type S05DesignLabFixtureId } from '@passwo/training-content';
import { useMemo } from 'react';
import type { DesktopPlatform } from '@passwo/ui';
import {
  S05AnalysisTraining,
  type S05AnalysisTrainingProps,
} from '../features/training/segments/S05/S05AnalysisTraining.js';
import type { S05InitialStructurePreset } from '../features/training/segments/S05/S05AnalysisController.js';

export function S05DesignLabTraining({
  fixtureId,
  initialSection,
  initialPersonalFindings,
  passwordOverride,
  initialStructurePreset,
  platform = 'mac',
  onComplete,
  onSemanticEvidenceChange,
}: {
  readonly fixtureId: S05DesignLabFixtureId;
  readonly initialSection?: S05AnalysisTrainingProps['initialSection'];
  readonly initialPersonalFindings?: S05AnalysisTrainingProps['initialPersonalFindings'];
  readonly passwordOverride?: string;
  readonly initialStructurePreset?: S05InitialStructurePreset;
  readonly platform?: DesktopPlatform;
  readonly onComplete?: () => void;
  readonly onSemanticEvidenceChange?: S05AnalysisTrainingProps['onSemanticEvidenceChange'];
}) {
  const fixture = getS05DesignLabFixture(fixtureId);
  const subject = useMemo(
    () =>
      passwordOverride === undefined ? fixture : { ...fixture, fictionalPassword: passwordOverride },
    [fixture, passwordOverride],
  );
  const completionPort = useMemo(
    () => (onComplete === undefined ? undefined : { complete: onComplete }),
    [onComplete],
  );
  return (
    <S05AnalysisTraining
      subject={subject}
      initialSection={initialSection ?? fixture.startSection}
      platform={platform}
      {...(initialPersonalFindings === undefined ? {} : { initialPersonalFindings })}
      {...(initialStructurePreset === undefined ? {} : { initialStructurePreset })}
      {...(completionPort === undefined ? {} : { completionPort })}
      {...(onSemanticEvidenceChange === undefined ? {} : { onSemanticEvidenceChange })}
    />
  );
}
