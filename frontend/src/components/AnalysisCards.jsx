import { FaCopy, FaDownload, FaFileLines } from 'react-icons/fa6';

import styles from './AnalysisCards.module.css';

function AnalysisCard({ title, icon, children, wide = false }) {
  return (
    <article className={`${styles.card} ${wide ? styles.wide : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>{icon}</div>
        <h3>{title}</h3>
      </div>
      <div className={styles.cardBody}>{children}</div>
    </article>
  );
}

export default function AnalysisCards({ analysis, onCopy, onDownload, onClear }) {
  const authors = Array.isArray(analysis.authors) ? analysis.authors : [];

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionKicker}>Structured analysis</p>
          <h2 className={styles.sectionTitle}>Gemini summary</h2>
        </div>

        <div className={styles.actionGroup}>
          <button type="button" className={styles.actionButton} onClick={onCopy}>
            <FaCopy /> Copy result
          </button>
          <button type="button" className={styles.actionButton} onClick={onDownload}>
            <FaDownload /> Download JSON
          </button>
          <button type="button" className={styles.actionButtonSecondary} onClick={onClear}>
            <FaFileLines /> Clear
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <AnalysisCard title="Document Type" icon={<FaFileLines />}>
          <p>{analysis.documentType || 'Not identified'}</p>
        </AnalysisCard>

        <AnalysisCard title="Title" icon={<FaFileLines />}>
          <p>{analysis.title || 'Not identified'}</p>
        </AnalysisCard>

        <AnalysisCard title="Authors" icon={<FaFileLines />}>
          {authors.length > 0 ? (
            <div className={styles.authorList}>
              {authors.map((author) => (
                <span key={author} className={styles.authorChip}>
                  {author}
                </span>
              ))}
            </div>
          ) : (
            <p>Not identified</p>
          )}
        </AnalysisCard>

        <AnalysisCard title="Summary" icon={<FaFileLines />} wide>
          <p className={styles.longText}>{analysis.summary || 'No summary returned.'}</p>
        </AnalysisCard>

        <AnalysisCard title="Key Takeaway" icon={<FaFileLines />} wide>
          <p className={styles.longText}>{analysis.keyTakeaway || 'No key takeaway returned.'}</p>
        </AnalysisCard>
      </div>
    </section>
  );
}
