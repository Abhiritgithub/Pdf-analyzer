import { useRef, useState } from 'react';

import { analyzePdf } from '../services/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/Header';
import PdfForm from '../components/PdfForm';
import AnalysisCards from '../components/AnalysisCards';
import Toast from '../components/Toast';
import styles from './HomePage.module.css';

const RECENT_URLS_LIMIT = 5;

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const [recentUrls, setRecentUrls] = useLocalStorage('pdf-analyzer-recent-urls', []);
  const { isDarkMode, toggleTheme } = useTheme();
  const toastTimerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast((currentToast) => ({ ...currentToast, visible: false }));
    }, 2800);
  };

  const updateRecentUrls = (nextUrl) => {
    setRecentUrls((currentUrls) => {
      const uniqueUrls = [nextUrl, ...currentUrls.filter((storedUrl) => storedUrl !== nextUrl)];
      return uniqueUrls.slice(0, RECENT_URLS_LIMIT);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError('Please enter a PDF URL.');
      showToast('Please enter a PDF URL.', 'error');
      return;
    }

    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setError('Only http:// and https:// URLs are allowed.');
      showToast('Only http:// and https:// URLs are allowed.', 'error');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await analyzePdf(trimmedUrl);
      setAnalysis(response);
      updateRecentUrls(trimmedUrl);
      showToast('PDF analysis completed.', 'success');
    } catch (requestError) {
      const message = requestError?.response?.data?.message || requestError?.message || 'Unable to analyze the PDF.';
      setAnalysis(null);
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!analysis) {
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
      showToast('Analysis copied to clipboard.', 'success');
    } catch {
      showToast('Copy failed. Your browser may block clipboard access.', 'error');
    }
  };

  const handleDownload = () => {
    if (!analysis) {
      return;
    }

    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = downloadUrl;
    anchor.download = 'pdf-analysis.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(downloadUrl);
    showToast('Analysis JSON downloaded.', 'success');
  };

  const handleClear = () => {
    setUrl('');
    setAnalysis(null);
    setError('');
    setRecentUrls([]);
    showToast('Form cleared.', 'success');
  };

  return (
    <div className={styles.shell}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.container}>
        <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />

        <main className={styles.main}>
          <section className={styles.hero}>
            <p className={styles.badge}>Fast, secure, structured PDF intelligence</p>
            <h2>Paste a public PDF URL and get an AI-generated document brief in seconds.</h2>
            <p className={styles.description}>
              PDF Analyzer downloads the document securely, extracts the text, sends it to Gemini, and returns a clean JSON summary you can copy or download.
            </p>
          </section>

          <section className={styles.workspace}>
            <PdfForm
              url={url}
              onUrlChange={setUrl}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onClear={handleClear}
              recentUrls={recentUrls}
              onPickRecentUrl={setUrl}
            />

            {error ? <div className={styles.errorBanner}>{error}</div> : null}

            {analysis ? (
              <AnalysisCards analysis={analysis} onCopy={handleCopy} onDownload={handleDownload} onClear={handleClear} />
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>No analysis yet</p>
                <p className={styles.emptyText}>
                  Enter a public PDF link to see the extracted document type, title, authors, summary, and key takeaway.
                </p>
              </div>
            )}
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <p className={styles.footerLabel}>PDF Analyzer AI</p>
              <p className={styles.footerText}>
                Analyze research papers using Google Gemini AI. Generate summaries, identify document types, extract authors, and surface key insights.
              </p>
            </div>

            <div className={styles.footerColumn}>
              <p className={styles.footerHeading}>Features</p>
              <ul className={styles.footerList}>
                <li>AI Summary</li>
                <li>PDF Analysis</li>
                <li>Research Papers</li>
                <li>Gemini AI</li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <p className={styles.footerHeading}>Developers</p>
              <ul className={styles.footerList}>
                <li>Abhishek Sahu</li>
              </ul>
           
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>© 2026 PDF Analyzer AI. All rights reserved.</p>
            <p>Built with React • Node.js • Gemini AI</p>
          </div>
        </footer>
      </div>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}
