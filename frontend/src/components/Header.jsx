import { FaMoon, FaSun } from 'react-icons/fa6';

import styles from './Header.module.css';

export default function Header({ isDarkMode, onToggleTheme }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.mark}>PDF</div>
        <div>
          <p className={styles.caption}>AI document intelligence</p>
          <h1 className={styles.title}>PDF Analyzer</h1>
        </div>
      </div>

      <button type="button" className={styles.themeButton} onClick={onToggleTheme} aria-label="Toggle color theme">
        {isDarkMode ? <FaSun /> : <FaMoon />}
        <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
      </button>
    </header>
  );
}
