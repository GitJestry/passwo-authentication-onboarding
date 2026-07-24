export type PasswordComparisonOutcome = 'identical' | 'similar' | 'unique';

export type PasswordComparisonContext = 'actual-selection' | 'hypothetical-example';

export type AuthoredComparisonCue = 'complete-match' | 'shared-core' | 'similar-construction';

export interface AuthoredPasswordComparisonResult {
  readonly source: 'authored-fixture';
  readonly fixtureId: string;
  readonly sourceAccountId: string;
  readonly targetAccountId: string;
  readonly outcome: PasswordComparisonOutcome;
  readonly context: PasswordComparisonContext;
  readonly cues: readonly AuthoredComparisonCue[];
}
