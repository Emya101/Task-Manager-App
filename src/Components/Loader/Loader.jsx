import styles from './Loader.module.css';

export function Loader({ theme }) {
  return (
    <div className={`${styles.Backdrop} ${theme === "dark" ? styles.Dark : ""}`}>
      <div className={styles.Loader}></div>
    </div>
  );
}
