import { s05Content } from '@passwo/training-content';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';
import accountContextAsset from '../../../../assets/s05/category-logos/account-context.webp';
import commonCoresAsset from '../../../../assets/s05/category-logos/common-cores.webp';
import personalDetailsAsset from '../../../../assets/s05/category-logos/personal-details.webp';
import type {
  S05ComponentCategoryId,
  S05DisplayFinding,
} from './S05ComponentStrategy.js';
import styles from './PasswordCategoryIcon.module.css';

export interface PasswordCategoryHoverCoachContextValue {
  readonly activeTargetId: string | null;
  readonly enabled: boolean;
  readonly sceneKey: string;
  readonly claim: (targetId: string, sceneKey: string) => void;
  readonly dismiss: () => void;
}

const PasswordCategoryHoverCoachContext =
  createContext<PasswordCategoryHoverCoachContextValue | null>(null);

export function PasswordCategoryHoverCoachProvider({
  children,
  value,
}: {
  readonly children: ReactNode;
  readonly value: PasswordCategoryHoverCoachContextValue;
}) {
  return (
    <PasswordCategoryHoverCoachContext.Provider value={value}>
      {children}
    </PasswordCategoryHoverCoachContext.Provider>
  );
}

export const passwordCategoryAssets = {
  'common-components': commonCoresAsset,
  'personal-details': personalDetailsAsset,
  'account-context': accountContextAsset,
} as const satisfies Readonly<Record<S05ComponentCategoryId, string>>;

function categoryLabel(categoryId: S05ComponentCategoryId): string {
  const category = s05Content.componentStrategy.categories.find(({ id }) => id === categoryId);
  if (category === undefined) {
    throw new Error(`Missing participant label for password category ${categoryId}`);
  }
  return category.title;
}

export function PasswordCategoryIcon({
  categoryId,
  decorative = false,
}: {
  readonly categoryId: S05ComponentCategoryId;
  readonly decorative?: boolean;
}) {
  return (
    <img
      className={styles.icon}
      src={passwordCategoryAssets[categoryId]}
      width={768}
      height={768}
      alt={decorative ? '' : categoryLabel(categoryId)}
      data-category={categoryId}
    />
  );
}

export function PasswordCategoryIconStack({
  findings,
  flow = false,
}: {
  readonly findings: readonly S05DisplayFinding[];
  readonly flow?: boolean;
}) {
  const stackRef = useRef<HTMLSpanElement | null>(null);
  const coachTargetId = useId();
  const hoverCoach = useContext(PasswordCategoryHoverCoachContext);
  const categories = [...new Set(findings.map(({ categoryId }) => categoryId))].flatMap(
    (categoryId) =>
      categoryId === 'repetition'
        ? []
        : [
            {
              categoryId,
              labels: [
                ...new Set(
                  findings
                    .filter((finding) => finding.categoryId === categoryId)
                    .map(({ label }) => label),
                ),
              ],
            },
          ],
  );

  useEffect(() => {
    const stack = stackRef.current;
    if (
      stack === null ||
      hoverCoach === null ||
      !hoverCoach.enabled ||
      categories.length === 0
    ) {
      return undefined;
    }
    const touchOnly =
      window.matchMedia('(hover: none)').matches && window.navigator.maxTouchPoints > 0;
    if (touchOnly) return undefined;

    const claimWhenVisible = (): boolean => {
      const bounds = stack.getBoundingClientRect();
      const visible =
        bounds.width > 0 &&
        bounds.height > 0 &&
        bounds.right > 0 &&
        bounds.bottom > 0 &&
        bounds.left < window.innerWidth &&
        bounds.top < window.innerHeight;
      if (!visible) return false;

      hoverCoach.claim(coachTargetId, hoverCoach.sceneKey);
      return true;
    };

    if (claimWhenVisible() || !('IntersectionObserver' in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          claimWhenVisible();
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(stack);
    return () => observer.disconnect();
  }, [categories.length, coachTargetId, hoverCoach]);

  const coachActive = hoverCoach?.activeTargetId === coachTargetId;
  if (categories.length === 0) return null;
  return (
    <span
      ref={stackRef}
      className={styles.stack}
      data-flow={flow || undefined}
      data-count={categories.length}
      data-category-stack
      role="group"
      aria-label={s05Content.componentStrategy.presentation.categoryInfoGroupLabel}
    >
      {categories.map(({ categoryId, labels }, index) => {
        const classification = labels.join(', ');
        return (
          <button
            type="button"
            className={styles.trigger}
            aria-label={classification}
            data-hover-coach={coachActive && index === 0 ? true : undefined}
            key={categoryId}
            onFocus={hoverCoach?.dismiss}
            onPointerEnter={hoverCoach?.dismiss}
          >
            <PasswordCategoryIcon categoryId={categoryId} decorative />
            <span className={styles.tooltip} role="tooltip">
              {classification}
            </span>
            {coachActive && index === 0 ? (
              <span className={styles.hoverCoach} aria-hidden="true">
                <svg viewBox="0 0 34 42" focusable="false">
                  <path d="M11.2 19.2V7.4a3.2 3.2 0 0 1 6.4 0v8.2-2.7a3 3 0 0 1 6 0v3.7-1.8a2.8 2.8 0 0 1 5.6 0v9.4c0 8.1-4.7 13.1-12.2 13.1h-1.6c-4.1 0-7.1-1.9-9.5-5.7l-3.7-5.8a3.2 3.2 0 0 1 5.2-3.7l3.8 4.1v-7Z" />
                </svg>
                <span className={styles.hoverCoachQuestion}>?</span>
              </span>
            ) : null}
          </button>
        );
      })}
    </span>
  );
}
