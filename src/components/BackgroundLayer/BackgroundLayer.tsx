import styles from "./BackgroundLayer.module.scss";

export function BackgroundLayer() {
  return (
    <div className={styles.backgroundLayer} aria-hidden="true">
      <div className={styles.backgroundLayer__canvasSlot} />
    </div>
  );
}
