import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  adaptSupplementaryNavigation,
  referenceSupplementLinks,
  verifySupplementaryNavigation,
} from './reference-supplements.mjs';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const expectedSourcePath =
  'research/private/reference/secaware/passwords-authentication/2026-07-26/source';
const expectedBuildPath =
  'research/private/reference/secaware/passwords-authentication/2026-07-26/study-build';
const expectedTransformationPath = 'research/derived/reference-artifact-transform.yaml';
const expectedSnapshotId = 'secaware-passwords-authentication-2026-07-26';
const expectedReferenceVersion = 'secaware-passwords-authentication-v9-study-adapted-2026-07-30-r16';
const expectedSourceVersion = 'V9 (27.03.2026)';
const expectedEntryPoint = 'scormdriver/indexAPI.html';
const expectedCourseId = 'CwynTB5JDjzJgtE8M2SKmgtgC6sM4C4h';
const expectedCompletionMessageType = 'passwo:reference-completed';
const expectedCompletionRequestMessageType = 'passwo:reference-completion-request';
const expectedCheckpointMessageType = 'passwo:reference-checkpoint';
const expectedResumeMessageType = 'passwo:reference-resume';
const expectedContentReadyMessageType = 'passwo:reference-content-ready';
const expectedOpenSupplementMessageType = 'passwo:reference-open-supplement';
const expectedCheckpointIds = ['passwords', 'password-manager', 'mfa'];
const expectedSourceFileCount = 146;
const expectedSourceManifestSha256 =
  '4eee807687cad07e9856decd711a45a79076caf2ef9b9b6d6dae0401d23f821b';
const expectedBuildFileCount = 146;
const expectedBuildManifestSha256 =
  '92e63925f3e85165f6c44ba0c12dbf77b0e480b2176e492e6ded53b5d582ec79';
const expectedTransformationConfigSha256 =
  '7828d3f454a637e909dafdd9e8f98e0d3a0cc8cb8b5c597c92b79cd850d810d2';
const coursePath = 'scormcontent/index.html';
const driverPath = 'scormdriver/indexAPI.html';
const finalInstructionContinueBlockId = 'cld8nihms01nn1tdj5q8tcthv';
const blockedWindowOpenFiles = new Set([
  'scormcontent/assets/U4w9PDNngJxwB5_j/html5/lib/scripts/bootstrapper.min.js',
  'scormcontent/assets/U4w9PDNngJxwB5_j/html5/lib/scripts/slides.min.js',
  'scormcontent/assets/U4w9PDNngJxwB5_j/lms/scormdriver.js',
  'scormcontent/assets/VRuCzkjdJavVemQT/html5/lib/scripts/bootstrapper.min.js',
  'scormcontent/assets/VRuCzkjdJavVemQT/html5/lib/scripts/slides.min.js',
  'scormcontent/lib/mondrian/360a8061.js',
  'scormcontent/lib/rise/4a460832.js',
  'scormdriver/scormdriver.js',
]);
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
const hardenedNavigationFiles = new Set([
  ...blockedWindowOpenFiles,
  'scormcontent/lib/rise/d9b9ec3d.js',
  ...providerLogoTargets.map(({ relativePath }) => relativePath),
]);
const retainedLessons = [
  {
    id: 'qcxfbmtfmCPSe2IT04vnCXlpAHjuFDds',
    title: 'Passwörter & Authentifizierung',
    type: 'section',
  },
  {
    id: 'cCLcBEovpLj72dCgZ6HsfeQV4xIR2_Lv',
    title: 'Starke Passwörter',
    type: 'blocks',
  },
  {
    id: '8s5ZF8ravaGthNGdmPcOMPOpdjLwXR-O',
    title: 'Passwort-Manager',
    type: 'blocks',
  },
  {
    id: 'zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt',
    title: 'Multi-Faktor-Authentifizierung',
    type: 'blocks',
  },
];
const removedLessons = [
  { id: 'Ti_fsrlLUHNndcM9En6vVDUgA9f5i3Wx', title: 'Quiz: Passwörter & Authentifizierung // BE SecAware! ' },
  { id: '7rcfm_gAfAzVzRVVTR_iWnlKKBnZpaHM', title: 'VERÖFFENTLICHUNGSHINWEISE' },
  { id: 'HH7SqnNUTjwy5QdPUzFsX-aWNvrIcwkF', title: 'Nutzungshinweise' },
];
const expectedTransformationIds = [
  'lesson-Ti_fsrlLUHNndcM9En6vVDUgA9f5i3Wx-remove',
  'lesson-7rcfm_gAfAzVzRVVTR_iWnlKKBnZpaHM-remove',
  'lesson-HH7SqnNUTjwy5QdPUzFsX-aWNvrIcwkF-remove',
  'course-description-neutralize',
  'course-telemetry-disable',
  'course-external-targets-localize',
  'course-supplement-navigation-bridge',
  'runtime-popup-apis-disable',
  'course-exit-disable',
  'runtime-completion-action-bridge',
  'runtime-progress-checkpoint-bridge',
  'runtime-provider-logo-targets-localize',
  'driver-completion-bridge',
  'driver-progress-resume-relay',
];
const datasetPattern =
  /async function __fetchCourse\(\) \{\s*return Promise\.resolve\(deserialize\("([A-Za-z0-9+/=]+)"\)\)\s*\}/u;

function fail(message) {
  throw new Error(`Reference artifact verification failed: ${message}`);
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

function yamlScalar(yaml, key) {
  const match = yaml.match(new RegExp(`^\\s*${key}:\\s*["']?([^\\n"']+)["']?\\s*$`, 'mu'));
  return match?.[1]?.trim() ?? null;
}

function occurrenceCount(content, value) {
  return content.split(value).length - 1;
}

async function sha256(path) {
  return createHash('sha256')
    .update(await readFile(path))
    .digest('hex');
}

async function manifestHash(directory) {
  const files = await filesBelow(directory);
  const manifest = [];
  for (const file of files) {
    const relativePath = relative(directory, file).split(sep).join('/');
    const fileHash = await sha256(file);
    manifest.push(`${fileHash}  ${relativePath}\n`);
  }
  return {
    fileCount: files.length,
    sha256: createHash('sha256').update(manifest.join('')).digest('hex'),
  };
}

function courseDatasetFromHtml(html, description) {
  const match = html.match(datasetPattern);
  if (match?.[1] === undefined) {
    fail(`${description} has no extractable Base64 __fetchCourse dataset.`);
  }
  const parsed = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
  if (typeof parsed !== 'object' || parsed === null || !('course' in parsed)) {
    fail(`${description} has no decoded course object.`);
  }
  return parsed;
}

function requireCourse(dataset, description) {
  const { course } = dataset;
  if (typeof course !== 'object' || course === null || !Array.isArray(course.lessons)) {
    fail(`${description} has no valid course lesson array.`);
  }
  if (course.id !== expectedCourseId) {
    fail(`${description} has unexpected course ID ${String(course.id)}.`);
  }
  return course;
}

function lessonMap(course, description) {
  const result = new Map();
  for (const lesson of course.lessons) {
    if (typeof lesson !== 'object' || lesson === null || typeof lesson.id !== 'string') {
      fail(`${description} contains a lesson without a stable ID.`);
    }
    if (result.has(lesson.id)) {
      fail(`${description} contains duplicate lesson ID ${lesson.id}.`);
    }
    result.set(lesson.id, lesson);
  }
  return result;
}

function continueNavigation(course, lessonId, blockId, description) {
  const lesson = course.lessons.find((candidate) => candidate.id === lessonId);
  if (!lesson || !Array.isArray(lesson.items)) {
    fail(`${description} has no valid lesson blocks.`);
  }
  const block = lesson.items.at(-1);
  if (
    typeof block !== 'object' ||
    block === null ||
    block.id !== blockId ||
    block.family !== 'continue' ||
    !Array.isArray(block.items) ||
    block.items.length !== 1 ||
    typeof block.items[0] !== 'object' ||
    block.items[0] === null
  ) {
    fail(`${description} has an unexpected final Continue block.`);
  }
  return block.items[0];
}

function finalInstructionNavigation(course, description) {
  return continueNavigation(
    course,
    'zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt',
    finalInstructionContinueBlockId,
    description,
  );
}

const externalValueReplacements = new Map([
  [
    'https://articulateusercontent.com/assets/rise/assets/themes/classic/cover-image/30_wfh.jpg',
    'aBcORCWLh3hZzWVI.png',
  ],
  [
    'https://articulateusercontent.com/assets/rise/assets/themes/example-header-image.jpg',
    'aBcORCWLh3hZzWVI.png',
  ],
  [
    'https://images.articulate.com/f:jpg,b:fff,w:100,h:100,s:cover/rise/courses/CwynTB5JDjzJgtE8M2SKmgtgC6sM4C4h/transcoded-0QgQSLhGeaRWzUUg-250326_SA_StarkePasswoerter_V07_Feedback_TN_Cedli.0000000.jpg',
    '250326_SA_StarkePasswoerte.jpg',
  ],
  [
    'https://images.articulate.com/f:jpg,b:fff,w:100,h:100,s:cover/rise/courses/CwynTB5JDjzJgtE8M2SKmgtgC6sM4C4h/transcoded-U6z91YLK6DVraSXF-230620_SA_PasswortManager_V08_TN_Wolf.0000000.jpg',
    '230620_SA_PasswortManager_.jpg',
  ],
  [
    'https://images.articulate.com/f:jpg,b:fff,w:100,h:100,s:cover/rise/courses/CwynTB5JDjzJgtE8M2SKmgtgC6sM4C4h/transcoded-et_3bXG99WN2_H44-230623_SA_MultiFaktorAuthentifizierung_V04_TN_Cedli.0000000.jpg',
    '230623_SA_MultiFaktorAuthe.jpg',
  ],
  [
    'https://articulateusercontent.com/assets/rise/assets/block-defaults/mountains_thumb.jpg',
    'Oh4LFn/mountains.jpg',
  ],
  [
    'https://articulateusercontent.com/assets/rise/assets/block-defaults/paraglide.jpg',
    'Oh4LFn/mountains.jpg',
  ],
  [
    'https://articulateusercontent.com/assets/rise/assets/block-defaults/paraglide_thumb.jpg',
    'Oh4LFn/mountains.jpg',
  ],
  [
    '<iframe src="https://secaware.nrw/logo/logo_de_gesamt_starkepasswoerter_V9.php" height="2px"></iframe>',
    '<iframe src="../scormdriver/blank.html" height="2px"></iframe>',
  ],
  [
    '<iframe src="https://secaware.nrw/logo/logo_de_passwort-manager_V9.php" height="2px"></iframe>',
    '<iframe src="../scormdriver/blank.html" height="2px"></iframe>',
  ],
  [
    '<iframe src="https://secaware.nrw/logo/logo_de_multi-faktor-authentifizierung_V9.php" height="2px"></iframe>',
    '<iframe src="../scormdriver/blank.html" height="2px"></iframe>',
  ],
]);

function transformExpectedExternalValues(value) {
  if (typeof value === 'string') {
    return externalValueReplacements.get(value) ?? value;
  }
  if (Array.isArray(value)) return value.map(transformExpectedExternalValues);
  if (typeof value !== 'object' || value === null) return value;
  for (const [key, child] of Object.entries(value)) {
    value[key] = transformExpectedExternalValues(child);
  }
  return value;
}

function expectedAdaptedDataset(sourceDataset) {
  const expected = structuredClone(sourceDataset);
  const course = requireCourse(expected, 'source clone');
  const lessonsById = lessonMap(course, 'source clone');
  course.lessons = retainedLessons.map(({ id }) => lessonsById.get(id));
  course.description = '';
  if (typeof course.lmsOptions !== 'object' || course.lmsOptions === null) {
    fail('the source clone has no LMS options.');
  }
  course.lmsOptions.enableTelemetryCollection = false;
  course.lmsOptions.enableExitCourse = false;
  finalInstructionNavigation(course, 'source clone').title = 'Training abschließen';
  adaptSupplementaryNavigation(course);
  transformExpectedExternalValues(expected);
  return expected;
}

function verifyNoExternalDatasetTargets(dataset, allowedDescriptions) {
  function visit(value, path = 'dataset') {
    if (typeof value === 'string' && /https?:\/\//iu.test(value)) {
      if (allowedDescriptions.has(value)) return;
      fail(`generated dataset retains external URL at ${path}.`);
    }
    if (typeof value !== 'object' || value === null) return;
    for (const [key, child] of Object.entries(value)) visit(child, `${path}.${key}`);
  }
  visit(dataset);
}

async function verifyManifestFiles(sourceDirectory) {
  const manifest = await readFile(resolve(sourceDirectory, 'imsmanifest.xml'), 'utf8');
  const declaredPaths = [...manifest.matchAll(/<file href="([^"]+)"/gu)].map((match) =>
    decodeURIComponent(match[1].replaceAll('&amp;', '&')),
  );
  if (declaredPaths.length !== 140 || new Set(declaredPaths).size !== 140) {
    fail('imsmanifest.xml does not declare the expected 140 unique files.');
  }
  const missingPaths = declaredPaths.filter(
    (relativePath) => !existsSync(resolve(sourceDirectory, relativePath)),
  );
  if (missingPaths.length > 0) {
    fail(`imsmanifest.xml references missing source file ${missingPaths[0]}.`);
  }
}

async function verifyUnchangedCopiedFiles(sourceDirectory, buildDirectory) {
  const [sourceFiles, buildFiles] = await Promise.all([
    filesBelow(sourceDirectory),
    filesBelow(buildDirectory),
  ]);
  const sourcePaths = sourceFiles.map((path) => relative(sourceDirectory, path));
  const buildPaths = buildFiles.map((path) => relative(buildDirectory, path));
  if (JSON.stringify(sourcePaths) !== JSON.stringify(buildPaths)) {
    fail('the generated build file set differs from the original snapshot.');
  }
  for (const relativePath of sourcePaths) {
    const posixPath = relativePath.split(sep).join('/');
    if (
      posixPath === coursePath ||
      posixPath === driverPath ||
      hardenedNavigationFiles.has(posixPath)
    ) {
      continue;
    }
    const [sourceFile, buildFile] = await Promise.all([
      readFile(resolve(sourceDirectory, relativePath)),
      readFile(resolve(buildDirectory, relativePath)),
    ]);
    if (!sourceFile.equals(buildFile)) {
      fail(`generated file ${posixPath} changed outside the two declared HTML targets.`);
    }
  }
}

async function verifyRuntimeNavigationBlocked(buildDirectory) {
  for (const file of await filesBelow(buildDirectory)) {
    const content = await readFile(file, 'utf8').catch(() => null);
    if (content === null) continue;
    const relativePath = relative(buildDirectory, file).split(sep).join('/');
    if (/window\.top\.window\.open\(|(?:^|[^\w.-])window\.open\(/u.test(content)) {
      fail(`generated runtime retains window.open in ${relativePath}.`);
    }
    if (/target\s*=\s*["']_blank/iu.test(content)) {
      fail(`generated runtime retains a popup target in ${relativePath}.`);
    }
    if (/(?:href|src)\s*=\s*["']https?:\/\//iu.test(content)) {
      fail(`generated runtime retains an external href or src in ${relativePath}.`);
    }
    if (/<form\b[^>]*\baction\s*=\s*["']https?:\/\//iu.test(content)) {
      fail(`generated runtime retains an external form target in ${relativePath}.`);
    }
    if (providerLogoTargets.some(({ url }) => content.includes(url))) {
      fail(`generated runtime retains a provider logo target in ${relativePath}.`);
    }
  }
  const courseHtml = await readFile(resolve(buildDirectory, coursePath), 'utf8');
  if (
    courseHtml.includes('https://metrics.articulate.com/v1/import') ||
    /fetch\(\s*["']https?:\/\//iu.test(courseHtml)
  ) {
    fail('generated runtime retains an external fetch target.');
  }
}

async function verify() {
  if (
    process.argv.includes('--if-reference-study') &&
    process.env.STUDY_ASSIGNMENT_MODE === 'forced-supportive'
  ) {
    process.stdout.write('Reference artifact verification skipped for forced-supportive mode.\n');
    return;
  }

  const sourceDirectory = resolve(repositoryRoot, expectedSourcePath);
  const buildDirectory = resolve(repositoryRoot, expectedBuildPath);
  const metadataPath = resolve(repositoryRoot, 'research/derived/reference-artifact.yaml');
  const transformationPath = resolve(repositoryRoot, expectedTransformationPath);
  const contractPath = resolve(repositoryRoot, 'packages/contracts/src/training.ts');

  for (const [path, description] of [
    [sourceDirectory, 'private source directory'],
    [buildDirectory, 'generated study build directory'],
    [metadataPath, 'artifact metadata'],
    [transformationPath, 'transformation configuration'],
  ]) {
    if (!existsSync(path)) {
      fail(`the ${description} is missing.`);
    }
  }
  for (const directory of [sourceDirectory, buildDirectory]) {
    if (!existsSync(resolve(directory, expectedEntryPoint))) {
      fail(`${relative(repositoryRoot, directory)} is missing the expected HTML entry point.`);
    }
  }

  const [metadata, transformations, contracts, sourceManifest, buildManifest] = await Promise.all([
    readFile(metadataPath, 'utf8'),
    readFile(transformationPath, 'utf8'),
    readFile(contractPath, 'utf8'),
    manifestHash(sourceDirectory),
    manifestHash(buildDirectory),
  ]);

  const metadataExpectations = [
    ['sourcePath', expectedSourcePath],
    ['studyBuildPath', expectedBuildPath],
    ['transformationPath', expectedTransformationPath],
    ['snapshotId', expectedSnapshotId],
    ['sourceArtifactVersion', expectedSourceVersion],
    ['visibleVersion', expectedSourceVersion],
    ['artifactVersion', expectedReferenceVersion],
    ['entryPoint', expectedEntryPoint],
    ['sourceFileCount', String(expectedSourceFileCount)],
    ['sourceManifestSha256', expectedSourceManifestSha256],
    ['studyBuildFileCount', String(expectedBuildFileCount)],
    ['studyBuildManifestSha256', expectedBuildManifestSha256],
    ['transformationConfigSha256', expectedTransformationConfigSha256],
    ['messageType', expectedCompletionMessageType],
  ];
  for (const [key, expectedValue] of metadataExpectations) {
    if (yamlScalar(metadata, key) !== expectedValue) {
      fail(`metadata field ${key} does not match ${expectedValue}.`);
    }
  }
  if (
    sourceManifest.fileCount !== expectedSourceFileCount ||
    sourceManifest.sha256 !== expectedSourceManifestSha256
  ) {
    fail('the original snapshot differs from its frozen deterministic manifest.');
  }
  if (
    buildManifest.fileCount !== expectedBuildFileCount ||
    buildManifest.sha256 !== expectedBuildManifestSha256
  ) {
    fail('the generated study build differs from its frozen deterministic manifest.');
  }
  if ((await sha256(transformationPath)) !== expectedTransformationConfigSha256) {
    fail('the transformation configuration differs from its frozen SHA-256.');
  }

  for (const value of [
    expectedReferenceVersion,
    expectedSnapshotId,
    expectedCompletionMessageType,
    expectedCheckpointMessageType,
    expectedResumeMessageType,
    expectedOpenSupplementMessageType,
  ]) {
    if (!contracts.includes(`'${value}'`)) {
      fail(`the canonical contract is missing ${value}.`);
    }
  }
  if (
    yamlScalar(transformations, 'schemaVersion') !== '1' ||
    yamlScalar(transformations, 'artifactVersion') !== expectedReferenceVersion ||
    yamlScalar(transformations, 'sourceVersion') !== expectedSourceVersion ||
    yamlScalar(transformations, 'courseId') !== expectedCourseId ||
    yamlScalar(transformations, 'messageType') !== expectedCompletionMessageType
  ) {
    fail('the transformation configuration identity fields are inconsistent.');
  }
  for (const { id } of [...retainedLessons, ...removedLessons]) {
    if (!transformations.includes(id)) {
      fail(`the transformation configuration omits lesson ID ${id}.`);
    }
  }
  for (const id of expectedTransformationIds) {
    if (!transformations.includes(`- id: ${id}`)) {
      fail(`the transformation configuration omits transformation ${id}.`);
    }
  }
  if (occurrenceCount(transformations, '    reason: ') !== expectedTransformationIds.length) {
    fail('each declared transformation must have exactly one reason.');
  }
  if (!transformations.includes(`messageType: ${expectedOpenSupplementMessageType}`)) {
    fail('the transformation configuration omits the supplement message type.');
  }
  for (const value of [
    `checkpointMessageType: ${expectedCheckpointMessageType}`,
    `resumeMessageType: ${expectedResumeMessageType}`,
    `contentReadyMessageType: ${expectedContentReadyMessageType}`,
  ]) {
    if (!transformations.includes(value)) {
      fail(`the transformation configuration omits ${value}.`);
    }
  }
  for (const checkpointId of expectedCheckpointIds) {
    if (!transformations.includes(`    - ${checkpointId}`)) {
      fail(`the transformation configuration omits checkpoint ${checkpointId}.`);
    }
  }
  for (const { id, url } of referenceSupplementLinks) {
    if (!transformations.includes(`id: ${id}`) || !transformations.includes(url)) {
      fail(`the transformation configuration omits supplementary link ${id}.`);
    }
  }

  await verifyManifestFiles(sourceDirectory);
  await verifyUnchangedCopiedFiles(sourceDirectory, buildDirectory);
  await verifyRuntimeNavigationBlocked(buildDirectory);

  const [sourceCourseHtml, buildCourseHtml, sourceDriverHtml, buildDriverHtml] = await Promise.all([
    readFile(resolve(sourceDirectory, coursePath), 'utf8'),
    readFile(resolve(buildDirectory, coursePath), 'utf8'),
    readFile(resolve(sourceDirectory, driverPath), 'utf8'),
    readFile(resolve(buildDirectory, driverPath), 'utf8'),
  ]);
  const sourceDataset = courseDatasetFromHtml(sourceCourseHtml, 'original snapshot');
  const buildDataset = courseDatasetFromHtml(buildCourseHtml, 'generated study build');
  const sourceCourse = requireCourse(sourceDataset, 'original snapshot');
  const buildCourse = requireCourse(buildDataset, 'generated study build');
  const sourceLessonsById = lessonMap(sourceCourse, 'original snapshot');
  const buildLessonsById = lessonMap(buildCourse, 'generated study build');
  const allowedSupplementDescriptions = verifySupplementaryNavigation(buildCourse);
  verifyNoExternalDatasetTargets(buildDataset, allowedSupplementDescriptions);

  if (
    typeof sourceCourse.description !== 'string' ||
    !sourceCourse.description.includes(`Version: ${expectedSourceVersion}`)
  ) {
    fail(`the source does not identify itself internally as ${expectedSourceVersion}.`);
  }
  if (sourceLessonsById.size !== retainedLessons.length + removedLessons.length) {
    fail('the source no longer has the expected seven-lesson structure.');
  }
  for (const { id, title, type } of retainedLessons) {
    const sourceLesson = sourceLessonsById.get(id);
    if (sourceLesson?.title !== title || sourceLesson.type !== type) {
      fail(`retained source lesson ${id} has unexpected metadata.`);
    }
  }
  for (const { id, title } of removedLessons) {
    if (sourceLessonsById.get(id)?.title !== title) {
      fail(`removable source lesson ${id} has unexpected metadata.`);
    }
  }

  if (
    JSON.stringify([...buildLessonsById.keys()]) !==
    JSON.stringify(retainedLessons.map(({ id }) => id))
  ) {
    fail('the generated participant path does not contain exactly the retained lesson IDs.');
  }
  for (const { id } of removedLessons) {
    if (buildLessonsById.has(id)) {
      fail(`removed lesson ${id} remains in the generated participant path.`);
    }
  }
  if (buildCourse.description !== '') {
    fail('the generated course description was not neutralized.');
  }
  if (
    typeof buildCourse.lmsOptions !== 'object' ||
    buildCourse.lmsOptions === null ||
    buildCourse.lmsOptions.enableTelemetryCollection !== false ||
    buildCourse.lmsOptions.enableExitCourse !== false
  ) {
    fail('the generated course still enables provider telemetry.');
  }
  if (
    finalInstructionNavigation(buildCourse, 'generated study build').title !==
    'Training abschließen'
  ) {
    fail('the final instructional Continue block does not complete the participant path.');
  }
  if (JSON.stringify(buildDataset) !== JSON.stringify(expectedAdaptedDataset(sourceDataset))) {
    fail('the generated dataset contains a change outside the declared course transformations.');
  }
  if (
    occurrenceCount(buildCourseHtml, 'passwo-reference-incomplete-completion-guard:start') !== 1 ||
    occurrenceCount(buildCourseHtml, 'passwo-reference-incomplete-completion-guard:end') !== 1 ||
    !buildCourseHtml.includes('event.stopImmediatePropagation()') ||
    !buildCourseHtml.includes("window.alert('Bitte bearbeite zunächst noch: '") ||
    !buildCourseHtml.includes(expectedCompletionRequestMessageType) ||
    !buildCourseHtml.includes('window.parent.postMessage(') ||
    !buildCourseHtml.includes("lesson.id === 'zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt'") ||
    !buildCourseHtml.includes('.nav-sidebar__outline-section-item a[href=') ||
    !buildCourseHtml.includes('nav-sidebar__outline-section-item--complete') ||
    buildCourseHtml.includes('window.Runtime') ||
    buildCourseHtml.includes('data-passwo-reference-completion-action')
  ) {
    fail('the generated course does not validate and bridge its original completion action.');
  }
  if (
    sourceCourseHtml.includes('passwo-reference-progress-bridge') ||
    occurrenceCount(buildCourseHtml, 'passwo-reference-progress-bridge:start') !== 1 ||
    occurrenceCount(buildCourseHtml, 'passwo-reference-progress-bridge:end') !== 1 ||
    occurrenceCount(buildCourseHtml, expectedCheckpointMessageType) !== 1 ||
    occurrenceCount(buildCourseHtml, expectedResumeMessageType) !== 1 ||
    occurrenceCount(buildCourseHtml, expectedContentReadyMessageType) !== 1 ||
    !buildCourseHtml.includes("window.addEventListener('hashchange', reportCurrentCheckpoint)") ||
    !buildCourseHtml.includes('event.source !== window.parent') ||
    !buildCourseHtml.includes('event.origin !== window.location.origin') ||
    !buildCourseHtml.includes('Object.keys(event.data).length !== 3')
  ) {
    fail('the generated course does not contain the bounded lesson checkpoint and resume bridge.');
  }
  for (const checkpointId of expectedCheckpointIds) {
    if (!buildCourseHtml.includes(`:${JSON.stringify(checkpointId)}`)) {
      fail(`the generated course progress bridge omits checkpoint ${checkpointId}.`);
    }
  }
  if (
    occurrenceCount(buildCourseHtml, 'passwo-reference-supplement-bridge:start') !== 1 ||
    occurrenceCount(buildCourseHtml, 'passwo-reference-supplement-bridge:end') !== 1 ||
    occurrenceCount(buildCourseHtml, 'PasswoOpenReferenceSupplement') !== 2
  ) {
    fail('the generated course does not contain the data-minimal supplement link bridge.');
  }
  for (const { id, url } of referenceSupplementLinks) {
    if (!buildCourseHtml.includes(`${JSON.stringify(url)}:${JSON.stringify(id)}`)) {
      fail(`the generated course bridge omits supplementary link ${id}.`);
    }
  }

  if (sourceDriverHtml.includes('passwo-reference-completion-bridge')) {
    fail('the original SCORM driver contains the generated completion bridge.');
  }
  if (
    occurrenceCount(buildDriverHtml, 'passwo-reference-completion-bridge:start') !== 1 ||
    occurrenceCount(buildDriverHtml, 'passwo-reference-completion-bridge:end') !== 1 ||
    occurrenceCount(buildDriverHtml, expectedCompletionMessageType) !== 1 ||
    occurrenceCount(buildDriverHtml, expectedCompletionRequestMessageType) !== 1 ||
    occurrenceCount(buildDriverHtml, expectedCheckpointMessageType) !== 1 ||
    occurrenceCount(buildDriverHtml, expectedResumeMessageType) !== 2 ||
    occurrenceCount(buildDriverHtml, expectedContentReadyMessageType) !== 1 ||
    occurrenceCount(buildDriverHtml, expectedOpenSupplementMessageType) !== 1 ||
    occurrenceCount(buildDriverHtml, expectedSnapshotId) !== 7 ||
    !buildDriverHtml.includes('originalSetReachedEnd.apply(window, arguments)') ||
    !buildDriverHtml.includes('event.source === window.scormdriver_content') ||
    !buildDriverHtml.includes('originalSetReachedEnd.apply(window, [])') ||
    occurrenceCount(buildDriverHtml, 'if (result !== false) reportCompletionOnce();') !== 1 ||
    !buildDriverHtml.includes('if (result !== false) reportCompletionOnce();') ||
    !buildDriverHtml.includes('reportCompletionOnce();') ||
    !buildDriverHtml.includes('event.source === window.scormdriver_content') ||
    !buildDriverHtml.includes('event.source === window.top') ||
    !buildDriverHtml.includes('Object.keys(event.data).length === 3') ||
    !buildDriverHtml.includes('pendingResumeCheckpointId = event.data.checkpointId') ||
    !buildDriverHtml.includes(
      `{ type: '${expectedCompletionMessageType}', snapshotId: '${expectedSnapshotId}' }`,
    )
  ) {
    fail('the generated driver does not contain the one-shot data-minimal completion bridge.');
  }

  const trackedPrivateFiles = spawnSync('git', ['ls-files', 'research/private'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
  if (trackedPrivateFiles.status !== 0) {
    fail('tracked-file protection could not be checked.');
  }
  if (trackedPrivateFiles.stdout.trim() !== '') {
    fail('one or more source or generated private artifact files are tracked by Git.');
  }

  process.stdout.write(
    `Reference artifact verified: ${expectedSourceVersion}, source ${sourceManifest.sha256}, study build ${buildManifest.sha256}.\n`,
  );
}

try {
  await verify();
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'Reference artifact verification failed.'}\n`,
  );
  process.exitCode = 1;
}
