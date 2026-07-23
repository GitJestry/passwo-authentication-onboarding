import { z } from 'zod';

export const passWoPoseSchema = z.enum([
  'neutral',
  'wave',
  'explain',
  'point',
  'caution',
  'idea',
  'dock',
  'flight',
]);
export type PassWoPose = z.infer<typeof passWoPoseSchema>;

export const passWoPlacementSchema = z.enum([
  'offscreen-left',
  'offscreen-right',
  'center',
  'bottom-left',
  'bottom-right',
  'focused-node',
]);
export type PassWoPlacement = z.infer<typeof passWoPlacementSchema>;
