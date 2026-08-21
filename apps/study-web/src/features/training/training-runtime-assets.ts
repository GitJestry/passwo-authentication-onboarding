import campusEmailHero from '../../assets/campus-sites/campus-mail-hero.webp';
import campusgramHero from '../../assets/campus-sites/campusgram-hero.webp';
import masterCampusHero from '../../assets/campus-sites/master-campus-hero.webp';
import attackerAsset from '../../assets/passwo/attacker.webp';
import passWoDockAsset from '../../assets/passwo/passwo-dock.webp';
import passWoWaitingAsset from '../../assets/passwo/passwo-waiting.webp';
import passWoWarningAsset from '../../assets/passwo/passwo-warning.webp';
import passWoWelcomeAsset from '../../assets/passwo/passwo-welcome.webp';
import accountContextAsset from '../../assets/s05/category-logos/account-context.webp';
import commonCoresAsset from '../../assets/s05/category-logos/common-cores.webp';
import personalDetailsAsset from '../../assets/s05/category-logos/personal-details.webp';
import typicalChangesAsset from '../../assets/s05/category-logos/typical-changes.webp';
import passwordFactorShieldAsset from '../../assets/s05/password-factor-shield.webp';
import comparisonPathShieldAsset from '../../assets/s06/comparison-path-shield.webp';
import whatIfLogoAsset from '../../assets/s06/what-if-logo.webp';
import passphrasePaperAsset from '../../assets/s07/passphrase-paper-backdrop.webp';
import searchStartArtworkAsset from '../../assets/s07/search-start-artwork.webp';

export type TrainingSegmentId =
  | 'entry'
  | 's00'
  | 's01'
  | 's02'
  | 's03'
  | 's04'
  | 's05'
  | 's06'
  | 's07'
  | 's08';

const imagesBySegment: Readonly<Record<TrainingSegmentId, readonly string[]>> = {
  entry: [passWoWelcomeAsset],
  s00: [
    masterCampusHero,
    campusEmailHero,
    campusgramHero,
    passWoDockAsset,
    passWoWaitingAsset,
    passWoWarningAsset,
  ],
  s01: [masterCampusHero, campusEmailHero, campusgramHero],
  s02: [passWoDockAsset, passWoWaitingAsset],
  s03: [],
  s04: [attackerAsset],
  s05: [
    attackerAsset,
    accountContextAsset,
    commonCoresAsset,
    personalDetailsAsset,
    typicalChangesAsset,
  ],
  s06: [passwordFactorShieldAsset, comparisonPathShieldAsset, whatIfLogoAsset],
  s07: [
    passwordFactorShieldAsset,
    comparisonPathShieldAsset,
    passphrasePaperAsset,
    searchStartArtworkAsset,
  ],
  s08: [passwordFactorShieldAsset, comparisonPathShieldAsset],
};

const imagePreloads = new Map<string, Promise<void>>();

function preloadImage(source: string, fetchPriority: 'high' | 'low'): Promise<void> {
  const existing = imagePreloads.get(source);
  if (existing !== undefined) return existing;

  const pending = new Promise<void>((resolve) => {
    const image = new Image();
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const decode = () => {
      if (image.naturalWidth === 0) {
        settle();
        return;
      }
      void image.decode().then(settle, settle);
    };
    image.decoding = 'async';
    image.fetchPriority = fetchPriority;
    image.addEventListener('load', decode, { once: true });
    image.addEventListener('error', settle, { once: true });
    image.src = source;
    if (image.complete) decode();
  });
  imagePreloads.set(source, pending);
  return pending;
}

export async function preloadTrainingSegmentImages(
  segmentId: TrainingSegmentId,
  fetchPriority: 'high' | 'low' = 'low',
): Promise<void> {
  await Promise.all(imagesBySegment[segmentId].map((source) => preloadImage(source, fetchPriority)));
}
