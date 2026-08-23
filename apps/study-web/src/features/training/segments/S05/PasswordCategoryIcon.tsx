import { s05Content } from '@passwo/training-content';
import { useId } from 'react';
import accountContextAsset from '../../../../assets/s05/category-logos/account-context.webp';
import commonCoresAsset from '../../../../assets/s05/category-logos/common-cores.webp';
import personalDetailsAsset from '../../../../assets/s05/category-logos/personal-details.webp';
import type {
  S05ComponentCategoryId,
  S05DisplayFinding,
} from './S05ComponentStrategy.js';
import styles from './PasswordCategoryIcon.module.css';

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
  const tooltipId = useId();
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
  if (categories.length === 0) return null;
  return (
    <span
      className={styles.stack}
      data-flow={flow || undefined}
      data-count={categories.length}
      data-category-stack
      role="group"
      aria-label={s05Content.componentStrategy.presentation.categoryInfoGroupLabel}
    >
      {categories.map(({ categoryId, labels }, index) => {
        const label = categoryLabel(categoryId);
        const descriptionId = `${tooltipId}-${index}`;
        return (
          <button
            type="button"
            className={styles.trigger}
            aria-label={label}
            aria-describedby={descriptionId}
            key={categoryId}
          >
            <PasswordCategoryIcon categoryId={categoryId} decorative />
            <span className={styles.tooltip} id={descriptionId} role="tooltip">
              <strong>{label}</strong>
              <span>{s05Content.componentStrategy.presentation.classificationLabel}</span>
              <span>{labels.join(', ')}</span>
            </span>
          </button>
        );
      })}
    </span>
  );
}
