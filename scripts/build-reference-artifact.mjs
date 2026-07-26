import { createHash } from 'node:crypto';
import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

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
const finalContinueBlockId = 'cld8nihms01nn1tdj5q8tcthv';

const datasetPattern =
  /async function __fetchCourse\(\) \{\s*return Promise\.resolve\(deserialize\("([A-Za-z0-9+/=]+)"\)\)\s*\}/u;
const completionPercentageSource = 'var completionPercentage = 80;';
const completionPercentageBuild = 'var completionPercentage = 100;';
const driverScriptTag = '  <script language="JavaScript1.2" src="scormdriver.js"></script>';
const completionBridge = `${driverScriptTag}
  <script type="text/javascript">
    // passwo-reference-completion-bridge:start
    (function installReferenceCompletionBridge() {
      var originalSetReachedEnd = window.SetReachedEnd;
      var completionReported = false;

      window.SetReachedEnd = function reportReachedEndOnce() {
        var result = originalSetReachedEnd.apply(window, arguments);
        if (!completionReported && result !== false) {
          completionReported = true;
          window.top.postMessage({ type: '${completionMessageType}' }, window.location.origin);
        }
        return result;
      };
    })();
    // passwo-reference-completion-bridge:end
  </script>`;

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

function findFinalContinueBlock(course) {
  const mfaLesson = course.lessons.find(
    (lesson) => lesson.id === 'zbxeD7QUdMnDlBWKvVsxMy5G8ghjnDRt',
  );
  if (!mfaLesson || !Array.isArray(mfaLesson.items)) {
    fail('the MFA lesson or its blocks are missing.');
  }
  const block = mfaLesson.items.at(-1);
  if (
    typeof block !== 'object' ||
    block === null ||
    block.id !== finalContinueBlockId ||
    block.family !== 'continue' ||
    !Array.isArray(block.items) ||
    block.items.length !== 1
  ) {
    fail(`the final Continue block ${finalContinueBlockId} has an unexpected structure.`);
  }
  const navigation = block.items[0];
  if (
    typeof navigation !== 'object' ||
    navigation === null ||
    navigation.title !== 'WEITER ZU PASSWÖRTER & AUTHENTIFIZIERUNG // BE SECAWARE!'
  ) {
    fail(`the final Continue block ${finalContinueBlockId} has unexpected navigation text.`);
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
    course.lmsOptions.enableTelemetryCollection !== true
  ) {
    fail('the expected enabled telemetry setting is missing.');
  }
  course.lmsOptions.enableTelemetryCollection = false;
  findFinalContinueBlock(course).title = 'Training abschließen';

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
adaptedCourseHtml = replaceExactlyOnce(
  adaptedCourseHtml,
  completionPercentageSource,
  completionPercentageBuild,
  'the completion percentage',
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
