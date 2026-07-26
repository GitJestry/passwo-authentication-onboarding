import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const registryPath = fileURLToPath(
  new URL('../packages/contracts/src/reference-supplement-links.json', import.meta.url),
);

function fail(message) {
  throw new Error(`Reference supplement configuration failed: ${message}`);
}

function requireString(value, description) {
  if (typeof value !== 'string' || value.length === 0) {
    fail(`${description} must be a non-empty string.`);
  }
  return value;
}

function parseRegistry(value) {
  if (!Array.isArray(value) || value.length !== 12) {
    fail('the canonical registry must contain exactly twelve links.');
  }

  const links = value.map((entry, index) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      fail(`registry entry ${String(index)} is not an object.`);
    }
    const id = requireString(entry.id, `registry entry ${String(index)} ID`);
    const url = requireString(entry.url, `registry entry ${String(index)} URL`);
    const protocol = new URL(url).protocol;
    if (protocol !== 'http:' && protocol !== 'https:') {
      fail(`registry entry ${id} does not use HTTP(S).`);
    }
    return Object.freeze({ id, url });
  });

  if (new Set(links.map(({ id }) => id)).size !== links.length) {
    fail('registry link IDs are not unique.');
  }
  if (new Set(links.map(({ url }) => url)).size !== links.length) {
    fail('registry URLs are not unique.');
  }
  return Object.freeze(links);
}

export const referenceSupplementLinks = parseRegistry(
  JSON.parse(await readFile(registryPath, 'utf8')),
);

const linksById = new Map(referenceSupplementLinks.map((link) => [link.id, link]));

export const supplementaryLinkTransforms = Object.freeze([
  {
    lessonId: 'cCLcBEovpLj72dCgZ6HsfeQV4xIR2_Lv',
    blockId: 'clcyqrhi30b8i1v5j20xtcln1',
    contentId: 'clcyos0ul00ck356oh84f07po',
    emptyAnchorCount: 4,
    linkIds: [
      'passwords-bsi-checklist',
      'passwords-bsi-guidance',
      'passwords-attack-vector',
      'passwords-consumer-advice',
      'passwords-password-card',
      'passwords-police-advice',
    ],
  },
  {
    lessonId: '8s5ZF8ravaGthNGdmPcOMPOpdjLwXR-O',
    blockId: 'cld0gdi350ki21v5j6401hdol',
    contentId: 'clcyos0ul00ck356oh84f07po',
    emptyAnchorCount: 0,
    linkIds: [
      'password-manager-bsi-overview',
      'password-manager-bsi-video',
      'password-manager-aware7',
    ],
  },
  {
    lessonId: 'zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt',
    blockId: 'cld8niho705ji1s5hbsxu7jff',
    contentId: 'clcyos0ul00ck356oh84f07po',
    emptyAnchorCount: 0,
    linkIds: ['mfa-bsi-basics', 'mfa-bsi-methods', 'mfa-consumer-advice'],
  },
]);

function objectById(root, id, description) {
  const matches = [];
  function visit(value) {
    if (typeof value !== 'object' || value === null) return;
    if (!Array.isArray(value) && value.id === id) matches.push(value);
    for (const child of Array.isArray(value) ? value : Object.values(value)) visit(child);
  }
  visit(root);
  if (matches.length !== 1) {
    fail(`${description} ${id} was found ${String(matches.length)} times.`);
  }
  return matches[0];
}

function contentForTransform(course, transform) {
  const lesson = objectById(course.lessons, transform.lessonId, 'lesson');
  const block = objectById(lesson, transform.blockId, 'block');
  return objectById(block, transform.contentId, 'content');
}

function attributeValue(attributes, name) {
  return attributes.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`, 'u'))?.[1] ?? null;
}

const anchorPattern = /<a\b([^>]*)>(.*?)<\/a>/gu;

export function adaptSupplementaryNavigation(course) {
  for (const transform of supplementaryLinkTransforms) {
    const content = contentForTransform(course, transform);
    if (typeof content.description !== 'string') {
      fail(`content ${transform.contentId} has no description.`);
    }

    let visibleIndex = 0;
    let emptyAnchorCount = 0;
    const adaptedDescription = content.description.replace(
      anchorPattern,
      (_anchor, attributes, innerHtml) => {
        if (innerHtml.trim().length === 0) {
          emptyAnchorCount += 1;
          return '';
        }

        const linkId = transform.linkIds[visibleIndex];
        if (linkId === undefined) {
          fail(`content ${transform.blockId} has an unexpected visible anchor.`);
        }
        const link = linksById.get(linkId);
        if (link === undefined) {
          fail(`link ID ${linkId} is missing from the canonical registry.`);
        }
        if (
          attributeValue(attributes, 'href') !== link.url ||
          attributeValue(attributes, 'target') !== '_blank' ||
          attributeValue(attributes, 'rel') !== 'noopener noreferrer'
        ) {
          fail(`source anchor ${linkId} differs from the frozen snapshot.`);
        }
        visibleIndex += 1;
        return `<a href="${link.url}" rel="noopener noreferrer" data-passwo-supplement-link-id="${link.id}">${innerHtml}</a>`;
      },
    );

    if (
      visibleIndex !== transform.linkIds.length ||
      emptyAnchorCount !== transform.emptyAnchorCount
    ) {
      fail(`content ${transform.blockId} has an unexpected anchor structure.`);
    }
    content.description = adaptedDescription;
  }
}

export function verifySupplementaryNavigation(course) {
  const allowedDescriptions = new Set();
  const verifiedIds = [];

  for (const transform of supplementaryLinkTransforms) {
    const content = contentForTransform(course, transform);
    if (typeof content.description !== 'string') {
      fail(`content ${transform.contentId} has no description.`);
    }

    let linkIndex = 0;
    for (const match of content.description.matchAll(anchorPattern)) {
      const attributes = match[1] ?? '';
      const innerHtml = match[2] ?? '';
      const expectedId = transform.linkIds[linkIndex];
      if (expectedId === undefined) {
        fail(`content ${transform.blockId} has an unexpected generated anchor.`);
      }
      const link = linksById.get(expectedId);
      if (
        link === undefined ||
        innerHtml.trim().length === 0 ||
        attributeValue(attributes, 'href') !== link.url ||
        attributeValue(attributes, 'rel') !== 'noopener noreferrer' ||
        attributeValue(attributes, 'data-passwo-supplement-link-id') !== expectedId ||
        attributeValue(attributes, 'target') !== null
      ) {
        fail(`generated anchor ${expectedId} is invalid.`);
      }
      verifiedIds.push(expectedId);
      linkIndex += 1;
    }
    if (linkIndex !== transform.linkIds.length) {
      fail(`content ${transform.blockId} does not expose all configured links.`);
    }
    allowedDescriptions.add(content.description);
  }

  if (
    verifiedIds.length !== referenceSupplementLinks.length ||
    new Set(verifiedIds).size !== referenceSupplementLinks.length
  ) {
    fail('the generated course does not expose exactly the canonical twelve links.');
  }
  return allowedDescriptions;
}
