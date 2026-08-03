import { FaArrowRight, FaBroom, FaClockRotateLeft } from 'react-icons/fa6';

import LoadingSpinner from './LoadingSpinner';
import styles from './PdfForm.module.css';

export default function PdfForm({
  url,
  onUrlChange,
  onSubmit,
  isLoading,
  onClear,
  recentUrls,
  onPickRecentUrl
}) {
  return (
    <section className={styles.panel}>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label} htmlFor="pdf-url">
          Paste a public PDF URL
        </label>

        <div className={styles.inputRow}>
          <input
            id="pdf-url"
            className={styles.input}
            type="url"
            inputMode="url"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            placeholder="https://example.com/document.pdf"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
          />

          <button type="submit" className={styles.primaryButton} disabled={isLoading}>
            {isLoading ? <LoadingSpinner label="Analyzing PDF..." /> : <><FaArrowRight /> Analyze</>}
          </button>
        </div>

        <div className={styles.actionsRow}>
          <button type="button" className={styles.secondaryButton} onClick={onClear}>
            <FaBroom /> Clear
          </button>
        </div>
      </form>

      {recentUrls.length > 0 ? (
        <div className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <FaClockRotateLeft />
            <span>Recent analyzed URLs</span>
          </div>
          <div className={styles.recentList}>
            {recentUrls.map((recentUrl) => (
              <button key={recentUrl} type="button" className={styles.recentChip} onClick={() => onPickRecentUrl(recentUrl)}>
                {recentUrl}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
