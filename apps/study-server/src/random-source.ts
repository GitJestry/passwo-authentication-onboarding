import { randomBytes, randomInt, randomUUID } from 'node:crypto';

export interface StudyRandomSource {
  randomUuid(): string;
  participantToken(): string;
  randomIndex(maxExclusive: number): number;
}

export const cryptoStudyRandomSource: StudyRandomSource = {
  randomUuid: () => randomUUID(),
  participantToken: () => randomBytes(4).toString('hex').toUpperCase(),
  randomIndex: (maxExclusive) => randomInt(maxExclusive),
};
