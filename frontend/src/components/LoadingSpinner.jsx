import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <span className={styles.wrapper} aria-live="polite" aria-busy="true">
      <span className={styles.spinner} />
      <span>{label}</span>
    </span>
  );
}
