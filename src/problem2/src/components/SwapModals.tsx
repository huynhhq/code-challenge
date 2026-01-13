// Components
import { Modal } from "./Modal";
import { CheckIcon, CloseIcon } from "./Icons";

// Types
import type { Token } from "../types";

// Utils
import { formatTokenAmount } from "../utils";

// Constants
import { CONSTANTS } from "../constants";

// Styles
import styles from "../styles/Modal.module.css";

interface SuccessModalProps {
  rate: number;
  isOpen: boolean;
  toAmount: string;
  fromAmount: string;
  toToken: Token | null;
  fromToken: Token | null;
  onClose: () => void;
}

export function SuccessModal({
  rate,
  isOpen,
  toToken,
  toAmount,
  fromToken,
  fromAmount,
  onClose,
}: SuccessModalProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = CONSTANTS.FALLBACK_TOKEN_ICON;
  };

  if (!fromToken || !toToken) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.successIcon}>
        <CheckIcon />
      </div>
      <h2 className={styles.title}>Swap Successful!</h2>
      <p className={styles.message}>
        Your swap has been completed successfully.
      </p>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>You Paid</span>
          <span className={styles.summaryValue}>
            <img
              src={fromToken.image}
              alt={fromToken.currency}
              onError={handleImageError}
            />
            {formatTokenAmount(parseFloat(fromAmount))} {fromToken.currency}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>You Received</span>
          <span className={styles.summaryValue}>
            <img
              src={toToken.image}
              alt={toToken.currency}
              onError={handleImageError}
            />
            {toAmount} {toToken.currency}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Exchange Rate</span>
          <span className={styles.summaryValue}>
            1 {fromToken.currency} = {formatTokenAmount(rate)}{" "}
            {toToken.currency}
          </span>
        </div>
      </div>

      <button className={styles.button} onClick={onClose} autoFocus>
        Done
      </button>
    </Modal>
  );
}

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function ErrorModal({ isOpen, onClose, message }: ErrorModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.errorModal}>
      <div className={styles.errorIcon}>
        <CloseIcon />
      </div>
      <h2 className={styles.errorTitle}>Swap Failed</h2>
      <p className={styles.message}>{message}</p>
      <button className={styles.secondaryButton} onClick={onClose} autoFocus>
        Try Again
      </button>
    </Modal>
  );
}
