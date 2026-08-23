import { s05Content } from '@passwo/training-content';
import accountContextAsset from '../../../../assets/s05/category-logos/account-context.webp';
import commonCoresAsset from '../../../../assets/s05/category-logos/common-cores.webp';
import personalDetailsAsset from '../../../../assets/s05/category-logos/personal-details.webp';
import { PasswordBuildingBlocks } from './PasswordBuildingBlocks.js';
import type { S05ComponentCategoryId } from './S05ComponentStrategy.js';
import styles from './PasswordComponentReview.module.css';

const categoryAssets = {
  'common-components': commonCoresAsset,
  'personal-details': personalDetailsAsset,
  'account-context': accountContextAsset,
} as const;

export interface PasswordComponentReviewEntry {
  readonly id: S05ComponentCategoryId;
  readonly title: string;
  readonly values: readonly string[];
  readonly status?: string;
}

/** The canonical S05 component-summary list, shared with the later account reflections. */
export function PasswordComponentReview({
  entries,
  layout = 'sidebar',
  live = false,
}: {
  readonly entries: readonly PasswordComponentReviewEntry[];
  readonly layout?: 'sidebar' | 'compact';
  readonly live?: boolean;
}) {
  return (
    <aside
      className={styles.review}
      data-layout={layout}
      aria-label={s05Content.componentStrategy.presentation.categoriesAriaLabel}
      aria-live={live ? 'polite' : undefined}
    >
      <h2>{s05Content.componentStrategy.presentation.reviewCardTitle}</h2>
      <div className={styles.entries}>
        {entries.map((entry) => (
          <article
            data-status={entry.status}
            data-category={entry.id}
            key={entry.id}
          >
            <div className={styles.heading}>
              <img src={categoryAssets[entry.id]} width={768} height={768} alt="" />
              <h3>{entry.title}</h3>
            </div>
            {entry.values.length === 0 ? (
              <strong className={styles.nothingFound}>
                {s05Content.componentStrategy.summary.nothingFound}
              </strong>
            ) : (
              <PasswordBuildingBlocks
                value={entry.values.join('')}
                parts={entry.values}
                display="decomposed"
                appearance="analysis"
                continuous
                animate={false}
                visualScale={0.75}
                categoryIds={entry.values.map(() => [entry.id])}
                ariaLabel={`${entry.title}: ${entry.values.join(', ')}`}
              />
            )}
          </article>
        ))}
      </div>
    </aside>
  );
}
