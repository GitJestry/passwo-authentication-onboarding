import { TRAINING_CONTENT_VERSION, trainingSegments } from '@passwo/training-content';
import { BrowserShell } from '@passwo/ui';
import styles from './App.module.css';

const tabs = [
  { id: 'foundation', label: 'PassWo Foundation', status: 'complete' as const },
  { id: 'study', label: 'Study Runtime' },
  { id: 'training', label: 'Training Runtime' },
];

export function App() {
  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="foundation-title">
        <p className={styles.eyebrow}>Repository Snapshot v0.1.2</p>
        <h1 id="foundation-title">PassWo Foundation</h1>
        <p>
          Die installierbare technische Grundlage ist vorhanden. Studienfluss, Training und
          Datenerhebung werden erst in den folgenden vertikalen Prompts implementiert.
        </p>
      </section>

      <BrowserShell
        tabs={tabs}
        activeTabId="foundation"
        address="https://campus.example/onboarding/foundation"
      >
        <div className={styles.browserContent}>
          <header className={styles.productHeader}>
            <div className={styles.brandMark} aria-hidden="true">P</div>
            <div>
              <strong>PassWo</strong>
              <span>Supportive Authentication Onboarding</span>
            </div>
          </header>

          <div className={styles.heroGrid}>
            <section className={styles.heroCopy}>
              <p className={styles.status}>Foundation bereit</p>
              <h2>Mechaniken zuerst. Inhalte danach.</h2>
              <p>
                Die App-Shell verbindet bereits Workspace, Designsystem und Content-Manifest,
                ohne einen unfertigen Studienablauf vorzutäuschen.
              </p>
              <dl className={styles.metrics}>
                <div>
                  <dt>{trainingSegments.length} Trainingssegmente</dt>
                  <dd>S00 bis S17 als versioniertes Manifest</dd>
                </div>
                <div>
                  <dt>2 getrennte Runtimes</dt>
                  <dd>Study Orchestrator und Training Mission Controller</dd>
                </div>
                <div>
                  <dt>0 persistierte Trainingsinputs</dt>
                  <dd>Fiktive Eingaben bleiben später ausschließlich flüchtig</dd>
                </div>
              </dl>
            </section>

            <aside className={styles.passwoCard} aria-label="PassWo Platzhalter">
              <div className={styles.keyHead} aria-hidden="true"><span /><b>•‿•</b></div>
              <div className={styles.keyBody} aria-hidden="true" />
              <div className={styles.speech}>
                <strong>Als Nächstes:</strong>
                <span>Prompt 1 installiert und verifiziert diese Foundation.</span>
              </div>
            </aside>
          </div>

          <footer className={styles.browserFooter}>
            Content-Version: <code>{TRAINING_CONTENT_VERSION}</code>
          </footer>
        </div>
      </BrowserShell>
    </main>
  );
}
