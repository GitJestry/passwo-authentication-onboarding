import { randomBytes, randomInt, randomUUID } from 'node:crypto';

export interface StudyRandomSource {
  randomUuid(): string;
  researchToken(): string;
  randomIndex(maxExclusive: number): number;
}

export const cryptoStudyRandomSource: StudyRandomSource = {
  randomUuid: () => randomUUID(),
  researchToken: () => randomBytes(8).toString('hex').toUpperCase(),
  randomIndex: (maxExclusive) => randomInt(maxExclusive),
};
