import { s05Content } from '@passwo/training-content';
import { PasswordCategoryIcon } from './PasswordCategoryIcon.js';
import type { S05ComponentCategoryId } from './S05ComponentStrategy.js';
import styles from './PasswordComponentReview.module.css';

export interface PasswordComponentReviewEntry {
  readonly id: S05ComponentCategoryId;
  readonly title: string;
}

/** The canonical S05 component-summary list, shared with the later account reflections. */
export function PasswordComponentReview({
  entries,
}: {
  readonly entries: readonly PasswordComponentReviewEntry[];
}) {
  return (
    <aside
      className={styles.review}
      aria-label={s05Content.componentStrategy.presentation.categoriesAriaLabel}
    >
      <h2>{s05Content.componentStrategy.presentation.reviewCardTitle}</h2>
      <ul className={styles.entries}>
        {entries.map((entry) => (
          <li data-category={entry.id} key={entry.id}>
            <span className={styles.entryIcon}>
              <PasswordCategoryIcon categoryId={entry.id} decorative />
            </span>
            <span>{entry.title}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
