import styles from "./TagList.module.scss";

type TagListProps = {
  tags: string[];
};

/** Inline list of mono uppercase tags. */
export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null;
  return (
    <ul className={styles.tagList} aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag} className={styles.tagList__tag}>
          {tag}
        </li>
      ))}
    </ul>
  );
}
