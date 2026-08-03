import { FaCircleCheck, FaCircleExclamation } from 'react-icons/fa6';

import styles from './Toast.module.css';

export default function Toast({ message, type = 'success', visible }) {
  if (!visible || !message) {
    return null;
  }

  const isError = type === 'error';

  return (
    <div className={`${styles.toast} ${isError ? styles.error : styles.success}`} role="status" aria-live="polite">
      {isError ? <FaCircleExclamation /> : <FaCircleCheck />}
      <span>{message}</span>
    </div>
  );
}
