import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(configDirectory, '../..');

export default {
  packagerConfig: {
    appBundleId: 'de.passwo.authentication-onboarding',
    appCategoryType: 'public.app-category.education',
    asar: {
      unpack: '**/*.node',
    },
    derefSymlinks: true,
    executableName: 'Authentication Onboarding',
    electronVersion: '43.2.0',
    extraResource: [
      resolve(repositoryRoot, 'apps/study-web/dist'),
      resolve(
        repositoryRoot,
        'research/private/reference/secaware/passwords-authentication/2026-07-26/study-build',
      ),
    ],
    name: 'Authentication Onboarding',
    osxSign: false,
    out: resolve(repositoryRoot, 'apps/study-desktop/out'),
  },
  makers: [],
};
