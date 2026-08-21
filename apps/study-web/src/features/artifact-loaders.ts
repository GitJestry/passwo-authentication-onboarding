export function loadSupportiveArtifactRenderer() {
  return import('./training/PasswordModuleTraining.js');
}

let supportiveArtifactWarmup: Promise<void> | null = null;

export function preloadSupportiveArtifactRuntime(): Promise<void> {
  supportiveArtifactWarmup ??= loadSupportiveArtifactRenderer().then((module) =>
    module.preloadPasswordModuleRuntime(),
  );
  return supportiveArtifactWarmup;
}

export function loadReferenceArtifactRenderer() {
  return import('./reference/ReferenceArtifact.js');
}
