import { createHash } from 'node:crypto';
import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  adaptSupplementaryNavigation,
  referenceSupplementLinks,
  supplementaryLinkTransforms,
  verifySupplementaryNavigation,
} from './reference-supplements.mjs';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const sourceDirectory = resolve(
  repositoryRoot,
  'research/private/reference/secaware/passwords-authentication/2026-07-26/source',
);
const buildDirectory = resolve(
  repositoryRoot,
  'research/private/reference/secaware/passwords-authentication/2026-07-26/study-build',
);
const coursePath = 'scormcontent/index.html';
const driverPath = 'scormdriver/indexAPI.html';

const expectedSourceFileCount = 146;
const expectedSourceManifestSha256 =
  '4eee807687cad07e9856decd711a45a79076caf2ef9b9b6d6dae0401d23f821b';
const expectedCourseId = 'CwynTB5JDjzJgtE8M2SKmgtgC6sM4C4h';
const expectedSourceVersion = 'V9 (27.03.2026)';
const completionMessageType = 'passwo:reference-completed';
const completionRequestMessageType = 'passwo:reference-completion-request';
const checkpointMessageType = 'passwo:reference-checkpoint';
const resumeMessageType = 'passwo:reference-resume';
const contentReadyMessageType = 'passwo:reference-content-ready';
const openSupplementMessageType = 'passwo:reference-open-supplement';
const snapshotId = 'secaware-passwords-authentication-2026-07-26';
const retainedLessonIds = [
  'qcxfbmtfmCPSe2IT04vnCXlpAHjuFDds',
  'cCLcBEovpLj72dCgZ6HsfeQV4xIR2_Lv',
  '8s5ZF8ravaGthNGdmPcOMPOpdjLwXR-O',
  'zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt',
];
const removedLessonIds = [
  'Ti_fsrlLUHNndcM9En6vVDUgA9f5i3Wx',
  '7rcfm_gAfAzVzRVVTR_iWnlKKBnZpaHM',
  'HH7SqnNUTjwy5QdPUzFsX-aWNvrIcwkF',
];
const finalInstructionContinueBlockId = 'cld8nihms01nn1tdj5q8tcthv';
const externalEmbedTransforms = [
  {
    lessonId: 'cCLcBEovpLj72dCgZ6HsfeQV4xIR2_Lv',
    blockId: 'cm8o8275j00ay2a6u9y2hldid',
    contentId: 'cm8o8275j00az2a6ublgjmz8q',
    url: 'https://secaware.nrw/logo/logo_de_gesamt_starkepasswoerter_V9.php',
  },
  {
    lessonId: '8s5ZF8ravaGthNGdmPcOMPOpdjLwXR-O',
    blockId: 'cm8px5ecl00ae07epepgrcuzr',
    contentId: 'cm7j2wr1v00892a6uolt7vec8',
    url: 'https://secaware.nrw/logo/logo_de_passwort-manager_V9.php',
  },
  {
    lessonId: 'zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt',
    blockId: 'cm8o8bz0800oh2a6uxr0a39fk',
    contentId: 'cm8o8bz0800oi2a6u78q2r37x',
    url: 'https://secaware.nrw/logo/logo_de_multi-faktor-authentifizierung_V9.php',
  },
];
const blockedWindowOpenFiles = [
  'scormcontent/assets/U4w9PDNngJxwB5_j/html5/lib/scripts/bootstrapper.min.js',
  'scormcontent/assets/U4w9PDNngJxwB5_j/html5/lib/scripts/slides.min.js',
  'scormcontent/assets/U4w9PDNngJxwB5_j/lms/scormdriver.js',
  'scormcontent/assets/VRuCzkjdJavVemQT/html5/lib/scripts/bootstrapper.min.js',
  'scormcontent/assets/VRuCzkjdJavVemQT/html5/lib/scripts/slides.min.js',
  'scormcontent/lib/mondrian/360a8061.js',
  'scormcontent/lib/rise/4a460832.js',
  'scormdriver/scormdriver.js',
];
const targetBlankFiles = ['scormcontent/lib/rise/4a460832.js', 'scormcontent/lib/rise/d9b9ec3d.js'];
const externalRuntimeHrefFiles = [
  'scormcontent/assets/U4w9PDNngJxwB5_j/html5/lib/scripts/bootstrapper.min.js',
  'scormcontent/assets/VRuCzkjdJavVemQT/html5/lib/scripts/bootstrapper.min.js',
];
const externalRuntimeHref = 'https://ipc.articulate.com/slw/360/en/streamingvideolocalplayback';
const providerLogoTargets = [
  {
    relativePath: 'scormcontent/assets/U4w9PDNngJxwB5_j/html5/data/js/6a3E34y11SQ.js',
    url: 'https://secaware.nrw/logo/logo_de_starkepasswoerter_V9.php',
  },
  {
    relativePath: 'scormcontent/assets/U4w9PDNngJxwB5_j/html5/data/js/5zz8UjEmkKy.js',
    url: 'https://secaware.nrw/logo/logo_de_starkepasswoerter_quiz_failed_V9.php',
  },
  {
    relativePath: 'scormcontent/assets/U4w9PDNngJxwB5_j/html5/data/js/5zz8UjEmkKy.js',
    url: 'https://secaware.nrw/logo/logo_de_starkepasswoerter_quiz_passed_V9.php',
  },
];

const datasetPattern =
  /async function __fetchCourse\(\) \{\s*return Promise\.resolve\(deserialize\("([A-Za-z0-9+/=]+)"\)\)\s*\}/u;
const completionPercentageSource = 'var completionPercentage = 80;';
const storylinePlaceholderHref = 'about:blank';
const completionGuardMarker = 'passwo-reference-incomplete-completion-guard';
const instructionalLessonIds = [
  'cCLcBEovpLj72dCgZ6HsfeQV4xIR2_Lv',
  '8s5ZF8ravaGthNGdmPcOMPOpdjLwXR-O',
  'zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt',
];
const finalInstructionLessonId = 'zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt';
const checkpointByLessonId = Object.freeze({
  cCLcBEovpLj72dCgZ6HsfeQV4xIR2_Lv: 'passwords',
  '8s5ZF8ravaGthNGdmPcOMPOpdjLwXR-O': 'password-manager',
  zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt: 'mfa',
});
const lessonIdByCheckpoint = Object.freeze(
  Object.fromEntries(Object.entries(checkpointByLessonId).map(([lessonId, id]) => [id, lessonId])),
);
const completionGuard = `  <script type="text/javascript">
    // ${completionGuardMarker}:start
    (function preventIncompleteReferenceCompletion() {
      var course = null;
      window.__fetchCourse().then(function cacheCourse(dataset) {
        course = dataset && dataset.course ? dataset.course : null;
      });

      function incompleteLessonTitles() {
        if (!course || !Array.isArray(course.lessons)) return [];
        return course.lessons
          .filter(function retainedInstruction(lesson) {
            return lesson && ${JSON.stringify(instructionalLessonIds)}.indexOf(lesson.id) !== -1;
          })
          .filter(function isIncomplete(lesson) {
            if (lesson.id === '${finalInstructionLessonId}') return false;
            var navigation = document.querySelector(
              '.nav-sidebar__outline-section-item a[href="#/lessons/' + lesson.id + '"]'
            );
            return !navigation || !navigation.parentElement ||
              !navigation.parentElement.classList.contains(
                'nav-sidebar__outline-section-item--complete'
              );
          })
          .map(function lessonTitle(lesson) {
            return lesson.title;
          });
      }

      function completionActionFrom(element) {
        var action = element instanceof Element
          ? element.closest('a, button, [role="button"]')
          : null;
        return action && action.textContent.trim() === 'Training abschließen' ? action : null;
      }

      document.addEventListener('click', function guardCompletion(event) {
        if (!completionActionFrom(event.target)) return;
        var incomplete = incompleteLessonTitles();
        if (incomplete.length > 0) {
          event.preventDefault();
          event.stopImmediatePropagation();
          window.alert('Bitte bearbeite zunächst noch: ' + incomplete.join(', ') + '.');
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        if (window.parent) {
          window.parent.postMessage(
            {
              type: '${completionRequestMessageType}',
              snapshotId: '${snapshotId}'
            },
            window.location.origin
          );
        }
      }, true);
    })();
    // ${completionGuardMarker}:end
  </script>`;
const telemetryFetchSource = `    return fetch('https://metrics.articulate.com/v1/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({batch: [telemetryData]})
    });`;
const telemetryFetchBuild = '    return Promise.resolve();';
const driverScriptTag = '  <script language="JavaScript1.2" src="scormdriver.js"></script>';
const courseBodyClose = '  </body>';
const completionBridge = `${driverScriptTag}
  <script type="text/javascript">
    // passwo-reference-completion-bridge:start
    (function installReferenceCompletionBridge() {
      var originalSetReachedEnd = window.SetReachedEnd;
      var completionReported = false;

      function reportCompletionOnce() {
        if (completionReported) return;
        completionReported = true;
        window.top.postMessage(
          { type: '${completionMessageType}', snapshotId: '${snapshotId}' },
          window.location.origin
        );
      }

      window.PasswoOpenReferenceSupplement = function openReferenceSupplement(linkId) {
        window.top.postMessage(
          {
            type: '${openSupplementMessageType}',
            snapshotId: '${snapshotId}',
            linkId: linkId
          },
          window.location.origin
        );
      };

      window.SetReachedEnd = function reportReachedEndOnce() {
        var result = originalSetReachedEnd.apply(window, arguments);
        if (result !== false) reportCompletionOnce();
        return result;
      };

      var pendingResumeCheckpointId = null;
      var lessonIdByCheckpoint = Object.freeze(${JSON.stringify(lessonIdByCheckpoint)});

      function forwardPendingResume() {
        if (!pendingResumeCheckpointId || !window.scormdriver_content) return;
        window.scormdriver_content.postMessage(
          {
            type: '${resumeMessageType}',
            snapshotId: '${snapshotId}',
            checkpointId: pendingResumeCheckpointId
          },
          window.location.origin
        );
      }

      window.addEventListener('message', function handleReferenceRuntimeMessage(event) {
        if (event.origin !== window.location.origin || typeof event.data !== 'object' || event.data === null) {
          return;
        }
        if (
          event.source === window.scormdriver_content &&
          event.data.type === '${completionRequestMessageType}' &&
          event.data.snapshotId === '${snapshotId}' &&
          Object.keys(event.data).length === 2
        ) {
          originalSetReachedEnd.apply(window, []);
          reportCompletionOnce();
          return;
        }
        if (
          event.source === window.scormdriver_content &&
          event.data.type === '${checkpointMessageType}' &&
          event.data.snapshotId === '${snapshotId}' &&
          Object.prototype.hasOwnProperty.call(lessonIdByCheckpoint, event.data.checkpointId) &&
          Object.keys(event.data).length === 3
        ) {
          window.top.postMessage(event.data, window.location.origin);
          return;
        }
        if (
          event.source === window.scormdriver_content &&
          event.data.type === '${contentReadyMessageType}' &&
          event.data.snapshotId === '${snapshotId}' &&
          Object.keys(event.data).length === 2
        ) {
          forwardPendingResume();
          return;
        }
        if (
          event.source === window.top &&
          event.data.type === '${resumeMessageType}' &&
          event.data.snapshotId === '${snapshotId}' &&
          Object.prototype.hasOwnProperty.call(lessonIdByCheckpoint, event.data.checkpointId) &&
          Object.keys(event.data).length === 3
        ) {
          pendingResumeCheckpointId = event.data.checkpointId;
          forwardPendingResume();
        }
      });
    })();
    // passwo-reference-completion-bridge:end
  </script>`;
const progressBridge = `  <script type="text/javascript">
    // passwo-reference-progress-bridge:start
    (function installReferenceProgressBridge() {
      var checkpointByLessonId = Object.freeze(${JSON.stringify(checkpointByLessonId)});
      var lessonIdByCheckpoint = Object.freeze(${JSON.stringify(lessonIdByCheckpoint)});
      var lastReportedCheckpointId = null;

      function currentLessonId() {
        var match = window.location.hash.match(/^#\/lessons\/([^/?#]+)/);
        return match ? decodeURIComponent(match[1]) : null;
      }

      function reportCurrentCheckpoint() {
        var lessonId = currentLessonId();
        var checkpointId = lessonId ? checkpointByLessonId[lessonId] : null;
        if (!checkpointId || checkpointId === lastReportedCheckpointId) return;
        lastReportedCheckpointId = checkpointId;
        window.parent.postMessage(
          {
            type: '${checkpointMessageType}',
            snapshotId: '${snapshotId}',
            checkpointId: checkpointId
          },
          window.location.origin
        );
      }

      window.addEventListener('hashchange', reportCurrentCheckpoint);
      window.addEventListener('message', function resumeReferenceLesson(event) {
        if (
          event.source !== window.parent ||
          event.origin !== window.location.origin ||
          typeof event.data !== 'object' ||
          event.data === null ||
          event.data.type !== '${resumeMessageType}' ||
          event.data.snapshotId !== '${snapshotId}' ||
          !Object.prototype.hasOwnProperty.call(lessonIdByCheckpoint, event.data.checkpointId) ||
          Object.keys(event.data).length !== 3
        ) {
          return;
        }
        var lessonId = lessonIdByCheckpoint[event.data.checkpointId];
        var targetHash = '#/lessons/' + lessonId;
        if (window.location.hash !== targetHash) window.location.hash = targetHash;
        window.setTimeout(reportCurrentCheckpoint, 0);
      });
      window.parent.postMessage(
        { type: '${contentReadyMessageType}', snapshotId: '${snapshotId}' },
        window.location.origin
      );
      window.setTimeout(reportCurrentCheckpoint, 0);
    })();
    // passwo-reference-progress-bridge:end
  </script>`;

const supplementBridge = `  <script type="text/javascript">
    // passwo-reference-supplement-bridge:start
    document.addEventListener('click', function openReferenceSupplement(event) {
      var element = event.target instanceof Element
        ? event.target.closest('a[href]')
        : null;
      if (!element) return;
      var supplementLinksByUrl = Object.freeze(${JSON.stringify(
        Object.fromEntries(referenceSupplementLinks.map(({ id, url }) => [url, id])),
      )});
      var href = element.getAttribute('href');
      var linkId = href ? supplementLinksByUrl[href] : null;
      if (!linkId) return;
      event.preventDefault();
      if (typeof window.parent.PasswoOpenReferenceSupplement === 'function') {
        window.parent.PasswoOpenReferenceSupplement(linkId);
      }
    }, true);
    // passwo-reference-supplement-bridge:end
  </script>
${courseBodyClose}`;

function fail(message) {
  throw new Error(`Reference artifact build failed: ${message}`);
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name, 'en'))) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await filesBelow(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files;
}

async function manifestHash(directory) {
  const files = await filesBelow(directory);
  const manifest = [];
  for (const file of files) {
    const relativePath = relative(directory, file).split(sep).join('/');
    const fileHash = createHash('sha256')
      .update(await readFile(file))
      .digest('hex');
    manifest.push(`${fileHash}  ${relativePath}\n`);
  }
  return {
    fileCount: files.length,
    sha256: createHash('sha256').update(manifest.join('')).digest('hex'),
  };
}

function replaceExactlyOnce(content, source, replacement, description) {
  const firstIndex = content.indexOf(source);
  if (firstIndex === -1 || content.indexOf(source, firstIndex + source.length) !== -1) {
    fail(`${description} was not found exactly once.`);
  }
  return `${content.slice(0, firstIndex)}${replacement}${content.slice(firstIndex + source.length)}`;
}

function courseDatasetFromHtml(html) {
  const match = html.match(datasetPattern);
  if (match?.[1] === undefined) {
    fail('the Base64 __fetchCourse dataset could not be extracted.');
  }
  const parsed = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
  if (typeof parsed !== 'object' || parsed === null || !('course' in parsed)) {
    fail('the decoded __fetchCourse dataset has no course.');
  }
  return { encoded: match[1], value: parsed };
}

function requireCourse(dataset) {
  const { course } = dataset;
  if (typeof course !== 'object' || course === null) {
    fail('the decoded course is not an object.');
  }
  if (course.id !== expectedCourseId) {
    fail(`unexpected course ID ${String(course.id)}.`);
  }
  if (
    typeof course.description !== 'string' ||
    !course.description.includes(expectedSourceVersion)
  ) {
    fail(`the source version is not exactly identifiable as ${expectedSourceVersion}.`);
  }
  if (!Array.isArray(course.lessons)) {
    fail('the decoded course has no lesson array.');
  }
  return course;
}

function requireLessonMap(course) {
  const lessonsById = new Map();
  for (const lesson of course.lessons) {
    if (typeof lesson !== 'object' || lesson === null || typeof lesson.id !== 'string') {
      fail('a course lesson has no stable ID.');
    }
    if (lessonsById.has(lesson.id)) {
      fail(`duplicate lesson ID ${lesson.id}.`);
    }
    lessonsById.set(lesson.id, lesson);
  }
  for (const id of [...retainedLessonIds, ...removedLessonIds]) {
    if (!lessonsById.has(id)) {
      fail(`expected lesson ${id} is missing.`);
    }
  }
  if (lessonsById.size !== retainedLessonIds.length + removedLessonIds.length) {
    fail('the source contains an unexpected lesson outside the frozen seven-lesson structure.');
  }
  return lessonsById;
}

function objectById(root, id, description) {
  const matches = [];
  function visit(value) {
    if (typeof value !== 'object' || value === null) return;
    if (!Array.isArray(value) && value.id === id) matches.push(value);
    for (const child of Array.isArray(value) ? value : Object.values(value)) visit(child);
  }
  visit(root);
  if (matches.length !== 1) {
    fail(`${description} ${id} was found ${matches.length} times instead of exactly once.`);
  }
  return matches[0];
}

function requireStringProperty(value, key, expected, description) {
  if (typeof value !== 'object' || value === null || value[key] !== expected) {
    fail(`${description} does not match the frozen snapshot.`);
  }
}

function replaceFrozenProperty(value, key, expected, replacement, description) {
  requireStringProperty(value, key, expected, description);
  value[key] = replacement;
}

function localizeExternalCourseMetadata(course) {
  replaceFrozenProperty(
    course.coverImage?.media?.image,
    'src',
    'https://articulateusercontent.com/assets/rise/assets/themes/classic/cover-image/30_wfh.jpg',
    'aBcORCWLh3hZzWVI.png',
    'course cover image source',
  );
  replaceFrozenProperty(
    course.theme,
    'coverImageDefault',
    'https://articulateusercontent.com/assets/rise/assets/themes/classic/cover-image/30_wfh.jpg',
    'aBcORCWLh3hZzWVI.png',
    'theme default cover image',
  );
  replaceFrozenProperty(
    course.theme,
    'navigationOverlayImage',
    'https://articulateusercontent.com/assets/rise/assets/themes/example-header-image.jpg',
    'aBcORCWLh3hZzWVI.png',
    'theme navigation overlay image',
  );

  for (const [contentId, thumbnail, poster] of [
    [
      'cl9mkalwr001i356t4lq0u4ws',
      'https://images.articulate.com/f:jpg,b:fff,w:100,h:100,s:cover/rise/courses/CwynTB5JDjzJgtE8M2SKmgtgC6sM4C4h/transcoded-0QgQSLhGeaRWzUUg-250326_SA_StarkePasswoerter_V07_Feedback_TN_Cedli.0000000.jpg',
      '250326_SA_StarkePasswoerte.jpg',
    ],
    [
      'cld0feqcp001l356onxv7kbnk',
      'https://images.articulate.com/f:jpg,b:fff,w:100,h:100,s:cover/rise/courses/CwynTB5JDjzJgtE8M2SKmgtgC6sM4C4h/transcoded-U6z91YLK6DVraSXF-230620_SA_PasswortManager_V08_TN_Wolf.0000000.jpg',
      '230620_SA_PasswortManager_.jpg',
    ],
    [
      'cld0fdtcu001a356oud0f81wr',
      'https://images.articulate.com/f:jpg,b:fff,w:100,h:100,s:cover/rise/courses/CwynTB5JDjzJgtE8M2SKmgtgC6sM4C4h/transcoded-et_3bXG99WN2_H44-230623_SA_MultiFaktorAuthentifizierung_V04_TN_Cedli.0000000.jpg',
      '230623_SA_MultiFaktorAuthe.jpg',
    ],
  ]) {
    const content = objectById(course.lessons, contentId, 'video content');
    replaceFrozenProperty(
      content.media?.video,
      'thumbnail',
      thumbnail,
      poster,
      `video thumbnail ${contentId}`,
    );
  }

  const mountainsBlock = objectById(
    course.lessons,
    'clckaak5r0070356olkqo180k',
    'password card block',
  );
  for (const cardId of [
    'cl9mjq539000a356twc7xh41f',
    'cl9mjq539000b356tm1wnkr8f',
    'cl9mjq539000c356tg1h4sbyz',
    'cl9mjqbyd000g356tkvnj5p92',
    'cl9mjqdil000i356tw4atzcqq',
  ]) {
    const card = objectById(mountainsBlock, cardId, 'password card');
    for (const side of ['front', 'back']) {
      replaceFrozenProperty(
        card[side]?.media?.image,
        'thumbnail',
        'https://articulateusercontent.com/assets/rise/assets/block-defaults/mountains_thumb.jpg',
        'Oh4LFn/mountains.jpg',
        `password card thumbnail ${cardId}.${side}`,
      );
    }
  }

  for (const { lessonId, blockId, contentId, url } of externalEmbedTransforms) {
    const lesson = objectById(course.lessons, lessonId, 'provider-marker lesson');
    const block = objectById(lesson, blockId, 'provider-marker block');
    const content = objectById(block, contentId, 'provider-marker content');
    const source = `<iframe src="${url}" height="2px"></iframe>`;
    const local = '<iframe src="../scormdriver/blank.html" height="2px"></iframe>';
    replaceFrozenProperty(
      content.media?.embed,
      'src',
      source,
      local,
      `provider-marker source ${contentId}`,
    );
    replaceFrozenProperty(
      content.media?.embed,
      'originalUrl',
      source,
      local,
      `provider-marker original URL ${contentId}`,
    );
  }

  for (const { lessonId, blockId, contentId } of supplementaryLinkTransforms) {
    const lesson = objectById(course.lessons, lessonId, 'supplementary lesson');
    const block = objectById(lesson, blockId, 'supplementary block');
    const content = objectById(block, contentId, 'supplementary content');
    replaceFrozenProperty(
      content.media?.tmp?.image,
      'src',
      'https://articulateusercontent.com/assets/rise/assets/block-defaults/paraglide.jpg',
      'Oh4LFn/mountains.jpg',
      `supplementary fallback image ${blockId}`,
    );
    replaceFrozenProperty(
      content.media?.tmp?.image,
      'thumbnail',
      'https://articulateusercontent.com/assets/rise/assets/block-defaults/paraglide_thumb.jpg',
      'Oh4LFn/mountains.jpg',
      `supplementary fallback thumbnail ${blockId}`,
    );
  }
}

function assertNoExternalDatasetTarget(dataset, allowedDescriptions) {
  function visit(value, path = 'dataset') {
    if (typeof value === 'string' && /https?:\/\//iu.test(value)) {
      if (allowedDescriptions.has(value)) return;
      fail(`external URL remains at ${path}.`);
    }
    if (typeof value !== 'object' || value === null) return;
    for (const [key, child] of Object.entries(value)) visit(child, `${path}.${key}`);
  }
  visit(dataset);
}

function findContinueNavigation(course, lessonId, blockId, description) {
  const lesson = course.lessons.find((candidate) => candidate.id === lessonId);
  if (!lesson || !Array.isArray(lesson.items)) {
    fail(`${description} lesson or its blocks are missing.`);
  }
  const block = lesson.items.at(-1);
  if (
    typeof block !== 'object' ||
    block === null ||
    block.id !== blockId ||
    block.family !== 'continue' ||
    !Array.isArray(block.items) ||
    block.items.length !== 1
  ) {
    fail(`${description} Continue block ${blockId} has an unexpected structure.`);
  }
  return block.items[0];
}

function finalInstructionCompletionNavigation(course) {
  const navigation = findContinueNavigation(
    course,
    'zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt',
    finalInstructionContinueBlockId,
    'final instructional',
  );
  if (
    typeof navigation !== 'object' ||
    navigation === null ||
    navigation.title !== 'WEITER ZU PASSWÖRTER & AUTHENTIFIZIERUNG // BE SECAWARE!'
  ) {
    fail(`the final instructional Continue block ${finalInstructionContinueBlockId} has unexpected navigation text.`);
  }
  return navigation;
}

function adaptCourseDataset(sourceDataset) {
  const adaptedDataset = structuredClone(sourceDataset);
  const course = requireCourse(adaptedDataset);
  const lessonsById = requireLessonMap(course);

  course.lessons = retainedLessonIds.map((id) => lessonsById.get(id));
  course.description = '';

  if (
    typeof course.lmsOptions !== 'object' ||
    course.lmsOptions === null ||
    course.lmsOptions.enableTelemetryCollection !== true ||
    course.lmsOptions.enableExitCourse !== true
  ) {
    fail('the expected source LMS options are missing.');
  }
  course.lmsOptions.enableTelemetryCollection = false;
  course.lmsOptions.enableExitCourse = false;
  finalInstructionCompletionNavigation(course).title = 'Training abschließen';
  adaptSupplementaryNavigation(course);
  localizeExternalCourseMetadata(course);
  const allowedDescriptions = verifySupplementaryNavigation(course);
  assertNoExternalDatasetTarget(adaptedDataset, allowedDescriptions);

  return adaptedDataset;
}

async function assertFrozenSource() {
  const sourceManifest = await manifestHash(sourceDirectory);
  if (
    sourceManifest.fileCount !== expectedSourceFileCount ||
    sourceManifest.sha256 !== expectedSourceManifestSha256
  ) {
    fail(
      `the original snapshot differs from the frozen ${expectedSourceFileCount}-file manifest ${expectedSourceManifestSha256}.`,
    );
  }
  return sourceManifest;
}

async function blockRuntimePopupApis() {
  for (const relativePath of blockedWindowOpenFiles) {
    const path = resolve(buildDirectory, relativePath);
    const source = await readFile(path, 'utf8');
    const topWindowCount = source.split('window.top.window.open(').length - 1;
    const directWindowCount = source.split('window.open(').length - 1 - topWindowCount;
    if (topWindowCount + directWindowCount === 0) {
      fail(`expected popup API is missing from ${relativePath}.`);
    }
    const blocked = source
      .replaceAll('window.top.window.open(', '(() => null)(')
      .replaceAll('window.open(', '(() => null)(');
    await writeFile(path, blocked, 'utf8');
  }
  for (const relativePath of targetBlankFiles) {
    const path = resolve(buildDirectory, relativePath);
    const source = await readFile(path, 'utf8');
    if (source.split('target="_blank"').length - 1 !== 1) {
      fail(`expected popup target is not unique in ${relativePath}.`);
    }
    await writeFile(path, source.replace('target="_blank"', 'target=""'), 'utf8');
  }
  for (const relativePath of externalRuntimeHrefFiles) {
    const path = resolve(buildDirectory, relativePath);
    const source = await readFile(path, 'utf8');
    if (source.split(externalRuntimeHref).length - 1 !== 1) {
      fail(`expected external runtime href is not unique in ${relativePath}.`);
    }
    await writeFile(path, source.replace(externalRuntimeHref, 'about:blank'), 'utf8');
  }
}

async function localizeProviderLogoTargets() {
  const targetsByPath = new Map();
  for (const target of providerLogoTargets) {
    const urls = targetsByPath.get(target.relativePath) ?? [];
    urls.push(target.url);
    targetsByPath.set(target.relativePath, urls);
  }
  for (const [relativePath, urls] of targetsByPath) {
    const path = resolve(buildDirectory, relativePath);
    let content = await readFile(path, 'utf8');
    for (const url of urls) {
      if (content.split(url).length - 1 !== 3) {
        fail(`expected provider logo URL is not present exactly three times in ${relativePath}.`);
      }
      content = content.replaceAll(url, storylinePlaceholderHref);
    }
    await writeFile(path, content, 'utf8');
  }
}

if (
  process.argv.includes('--if-reference-study') &&
  process.env.STUDY_ASSIGNMENT_MODE === 'forced-supportive'
) {
  process.stdout.write('Reference artifact build skipped for forced-supportive mode.\n');
  process.exit(0);
}

const sourceManifestBefore = await assertFrozenSource();
const sourceCourseHtml = await readFile(resolve(sourceDirectory, coursePath), 'utf8');
const sourceCourseDataset = courseDatasetFromHtml(sourceCourseHtml);
const adaptedDataset = adaptCourseDataset(sourceCourseDataset.value);
const adaptedBase64 = Buffer.from(JSON.stringify(adaptedDataset), 'utf8').toString('base64');

let adaptedCourseHtml = replaceExactlyOnce(
  sourceCourseHtml,
  sourceCourseDataset.encoded,
  adaptedBase64,
  'the encoded course dataset',
);
if (adaptedCourseHtml.split(completionPercentageSource).length - 1 !== 1) {
  fail('the native completion percentage is not exactly 80 percent.');
}
adaptedCourseHtml = replaceExactlyOnce(
  adaptedCourseHtml,
  telemetryFetchSource,
  telemetryFetchBuild,
  'the external telemetry fetch',
);
adaptedCourseHtml = replaceExactlyOnce(
  adaptedCourseHtml,
  courseBodyClose,
  `${completionGuard}\n${progressBridge}\n${supplementBridge}`,
  'the course body closing tag',
);

const sourceDriverHtml = await readFile(resolve(sourceDirectory, driverPath), 'utf8');
const adaptedDriverHtml = replaceExactlyOnce(
  sourceDriverHtml,
  driverScriptTag,
  completionBridge,
  'the SCORM driver script tag',
);

await rm(buildDirectory, { recursive: true, force: true });
await cp(sourceDirectory, buildDirectory, { recursive: true });
await Promise.all([
  writeFile(resolve(buildDirectory, coursePath), adaptedCourseHtml, 'utf8'),
  writeFile(resolve(buildDirectory, driverPath), adaptedDriverHtml, 'utf8'),
]);
await blockRuntimePopupApis();
await localizeProviderLogoTargets();

const [sourceManifestAfter, buildManifest] = await Promise.all([
  manifestHash(sourceDirectory),
  manifestHash(buildDirectory),
]);
if (
  sourceManifestAfter.fileCount !== sourceManifestBefore.fileCount ||
  sourceManifestAfter.sha256 !== sourceManifestBefore.sha256
) {
  fail('the original snapshot changed during generation.');
}

process.stdout.write(
  `Reference study artifact built from ${expectedSourceVersion}: ${buildManifest.fileCount} files, manifest SHA-256 ${buildManifest.sha256}.\n`,
);
