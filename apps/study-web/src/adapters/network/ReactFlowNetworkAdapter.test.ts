import { describe, expect, it } from 'vitest';
import { resolveNetworkSymbolId } from './NetworkSymbolRegistry.js';
import {
  createCircularEdgePath,
  layoutSceneNode,
  type NetworkCanvasSize,
} from './ReactFlowNetworkAdapter.js';

const canvas: NetworkCanvasSize = { width: 800, height: 500 };

describe('circular network renderer', () => {
  it('keeps authored positions deterministic while sizing accounts and details as circles', () => {
    const account = layoutSceneNode(
      { kind: 'account', position: { x: 1, y: 1 } },
      canvas,
      'account-map',
    );
    const detail = layoutSceneNode(
      { kind: 'service', position: { x: 1, y: 1 } },
      canvas,
      'account-map',
    );

    expect(account.layout).toEqual({ width: 112, height: 142, circleDiameter: 112 });
    expect(detail.layout).toEqual({ width: 76, height: 108, circleDiameter: 76 });
    expect(account.position).toEqual({ x: 688, y: 358 });
    expect(detail.position).toEqual({ x: 724, y: 392 });
  });

  it('uses explicit symbols and deterministic semantic fallbacks', () => {
    expect(
      resolveNetworkSymbolId({ id: 'campus-id', kind: 'account', symbolId: 'campus-id' }),
    ).toBe('campus-id');
    expect(resolveNetworkSymbolId({ id: 'campus-mail', kind: 'account' })).toBe('campus-mail');
    expect(resolveNetworkSymbolId({ id: 'generic-content', kind: 'content' })).toBe('content');
  });

  it('draws a quiet quadratic connection from one circle boundary to the other', () => {
    const edge = createCircularEdgePath(
      { centerX: 56, centerY: 56, radius: 56 },
      { centerX: 256, centerY: 56, radius: 38 },
    );

    expect(edge).toEqual({
      path: 'M 112 56 Q 165 70 218 56',
      labelX: 165,
      labelY: 63,
    });
  });
});
