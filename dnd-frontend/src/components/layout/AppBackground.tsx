import styles from "./AppBackground.module.css";

export function AppBackground() {
  return (
    <>
      <div className={styles.background} />
      <div className={styles.overlay} />
    </>
  );
}
