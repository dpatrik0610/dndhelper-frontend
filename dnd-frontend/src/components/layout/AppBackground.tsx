import styles from "./AppBackground.module.css";

/**
 * AppBackground
 * 
 * The default active background for the application.
 * Employs high-performance, non-distracting CSS orbs and twinkling stars
 * to create a beautiful, modern, and cozy fantasy space atmosphere.
 */
export function AppBackground() {
  return (
    <>
      {/* Base Obsidian Radial Gradient */}
      <div className={styles.background} />

      {/* Silent high-performance CSS animation layer */}
      <div className={styles.cssFallbackWrapper}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={styles.stars} />
      </div>

      {/* Semi-transparent overlay to secure readability of text content */}
      <div className={styles.overlay} />
    </>
  );
}
