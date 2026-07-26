import { z } from 'zod';
import rawReferenceSupplementLinks from './reference-supplement-links.json' with { type: 'json' };

const referenceSupplementLinkSchema = z
  .object({
    id: z.string().min(1),
    url: z.url().refine((value) => {
      const protocol = new URL(value).protocol;
      return protocol === 'http:' || protocol === 'https:';
    }, 'Reference supplement URLs must use HTTP(S).'),
  })
  .strict();

export type ReferenceSupplementLink = z.infer<typeof referenceSupplementLinkSchema>;

const parsedReferenceSupplementLinks = z
  .array(referenceSupplementLinkSchema)
  .length(12)
  .parse(rawReferenceSupplementLinks);

const referenceSupplementLinksById = new Map(
  parsedReferenceSupplementLinks.map((link) => [link.id, Object.freeze(link)]),
);

if (referenceSupplementLinksById.size !== parsedReferenceSupplementLinks.length) {
  throw new Error('Reference supplement link IDs must be unique.');
}

export const referenceSupplementLinks: readonly ReferenceSupplementLink[] = Object.freeze([
  ...referenceSupplementLinksById.values(),
]);

export const referenceSupplementLinkIdSchema = z
  .string()
  .refine(
    (value) => referenceSupplementLinksById.has(value),
    'Unknown reference supplement link ID.',
  );

export type ReferenceSupplementLinkId = z.infer<typeof referenceSupplementLinkIdSchema>;

export function referenceSupplementLinkForId(
  linkId: ReferenceSupplementLinkId,
): ReferenceSupplementLink {
  const link = referenceSupplementLinksById.get(linkId);
  if (link === undefined) {
    throw new Error('Unknown reference supplement link ID.');
  }
  return link;
}
