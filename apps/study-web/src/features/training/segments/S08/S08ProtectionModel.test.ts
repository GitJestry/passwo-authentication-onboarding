import type { S06AccountId } from '@passwo/contracts';
import type { SceneEdge } from '@passwo/visualization';
import { describe, expect, it } from 'vitest';
import {
  activeS08PasswordRelationships,
  s08AccountHasOpenActionNeed,
  s08HasOpenActionNeed,
  type S08ProtectionRiskModel,
} from '../account-network.js';

function relationship(
  sourceId: S06AccountId,
  targetId: S06AccountId,
): SceneEdge {
  return {
    id: `relation:${sourceId}:${targetId}`,
    sourceId,
    targetId,
    kind: 'similar-pattern',
    status: 'similar',
    label: null,
  };
}

function riskModel({
  localFindingAccountIds = [],
  relationships = [],
}: Partial<S08ProtectionRiskModel> = {}): S08ProtectionRiskModel {
  return { localFindingAccountIds, relationships };
}

describe('S08 open action needs', () => {
  it('allows either endpoint to resolve a relationship-only finding', () => {
    const model = riskModel({
      relationships: [relationship('master-campus', 'campus-email')],
    });

    expect(s08AccountHasOpenActionNeed(model, [], 'master-campus')).toBe(true);
    expect(s08AccountHasOpenActionNeed(model, [], 'campus-email')).toBe(true);
    expect(activeS08PasswordRelationships(model, ['master-campus'])).toEqual([]);
    expect(s08AccountHasOpenActionNeed(model, ['master-campus'], 'campus-email')).toBe(false);
    expect(s08HasOpenActionNeed(model, ['master-campus'])).toBe(false);
  });

  it('keeps the other account open when it has its own local finding', () => {
    const model = riskModel({
      localFindingAccountIds: ['campus-email'],
      relationships: [relationship('master-campus', 'campus-email')],
    });

    expect(s08AccountHasOpenActionNeed(model, ['master-campus'], 'campus-email')).toBe(true);
    expect(s08HasOpenActionNeed(model, ['master-campus'])).toBe(true);
  });

  it('keeps the other account open while another relationship remains', () => {
    const model = riskModel({
      relationships: [
        relationship('master-campus', 'campus-email'),
        relationship('campus-email', 'campusgram'),
      ],
    });

    expect(activeS08PasswordRelationships(model, ['master-campus'])).toEqual([
      relationship('campus-email', 'campusgram'),
    ]);
    expect(s08AccountHasOpenActionNeed(model, ['master-campus'], 'campus-email')).toBe(true);
  });

  it('keeps a local finding bound to its own account', () => {
    const model = riskModel({ localFindingAccountIds: ['master-campus'] });

    expect(s08AccountHasOpenActionNeed(model, [], 'master-campus')).toBe(true);
    expect(s08AccountHasOpenActionNeed(model, [], 'campus-email')).toBe(false);
    expect(s08AccountHasOpenActionNeed(model, ['master-campus'], 'master-campus')).toBe(false);
  });
});
