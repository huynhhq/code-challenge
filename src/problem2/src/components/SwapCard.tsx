import { useState, useCallback, type FormEvent, type ChangeEvent } from "react";

// Hooks
import { useSwap } from "../hooks";

// Context
import { useTokenContext } from "../context";

// Utils
import { formatUSD, formatTokenAmount, sanitizeAmountInput } from "../utils";

// Components
import { LoadingOverlay } from "./Modal";
import { TokenSelector } from "./TokenSelector";
import { SuccessModal, ErrorModal } from "./SwapModals";
import { SwapIcon, ChevronIcon, RefreshIcon } from "./Icons";

// Constants
import { CONSTANTS } from "../constants";

// Styles
import styles from "../styles/SwapCard.module.css";

export function SwapCard() {
  const { isLoading: tokensLoading, error: tokensError } = useTokenContext();
  const {
    error,
    toToken,
    canSwap,
    fromToken,
    isLoading,
    swapResult,
    buttonText,
    fromAmount,
    reset,
    setToToken,
    executeSwap,
    setFromToken,
    setFromAmount,
    swapTokenPositions,
  } = useSwap();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [rateExpanded, setRateExpanded] = useState(true);
  const [successData, setSuccessData] = useState<{
    toAmount: string;
    rate: number;
  } | null>(null);

  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeAmountInput(
        e.target.value,
        CONSTANTS.MAX_DECIMALS
      );
      setFromAmount(sanitized);
    },
    [setFromAmount]
  );

  const handleMaxClick = useCallback(() => {
    const simulatedBalance = (Math.random() * 10 + 0.1).toFixed(4);
    setFromAmount(simulatedBalance);
  }, [setFromAmount]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!canSwap || !swapResult) return;

      const success = await executeSwap();

      if (success) {
        setSuccessData({
          toAmount: formatTokenAmount(swapResult.toAmount),
          rate: swapResult.rate,
        });
        setShowSuccess(true);
      } else {
        setShowError(true);
      }
    },
    [canSwap, swapResult, executeSwap]
  );

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    setSuccessData(null);
    reset();
  }, [reset]);

  const handleErrorClose = useCallback(() => {
    setShowError(false);
  }, []);

  if (tokensLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading tokens...</p>
        </div>
      </div>
    );
  }

  if (tokensError) {
    return (
      <div className={styles.card}>
        <div className={styles.error}>
          <h2>Failed to Load</h2>
          <p>{tokensError}</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1>Swap</h1>
          <p className={styles.subtitle}>
            Trade tokens instantly at the best rates
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          {/* From Section */}
          <fieldset className={styles.section}>
            <div className={styles.sectionHeader}>
              <label htmlFor="from-amount">You Pay</label>
              <button
                type="button"
                className={styles.maxButton}
                onClick={handleMaxClick}
                aria-label="Use maximum balance"
              >
                MAX
              </button>
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.amountWrapper}>
                <input
                  id="from-amount"
                  type="text"
                  className={styles.amountInput}
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={handleAmountChange}
                  inputMode="decimal"
                  autoComplete="off"
                  aria-describedby="from-usd"
                />
                {swapResult && (
                  <span id="from-usd" className={styles.usdValue}>
                    ≈ {formatUSD(swapResult.fromValueUsd)}
                  </span>
                )}
              </div>
              <TokenSelector
                id="from-token"
                label="Source token"
                selectedToken={fromToken}
                onSelect={setFromToken}
                excludeToken={toToken}
              />
            </div>
          </fieldset>

          {/* Swap Direction Button */}
          <div className={styles.swapDirection}>
            <button
              type="button"
              className={styles.directionButton}
              onClick={swapTokenPositions}
              aria-label="Swap token positions"
              title="Swap token positions"
            >
              <SwapIcon />
            </button>
          </div>

          {/* To Section */}
          <fieldset className={styles.section}>
            <div className={styles.sectionHeader}>
              <label htmlFor="to-amount">You Receive</label>
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.amountWrapper}>
                <input
                  id="to-amount"
                  type="text"
                  className={styles.amountInput}
                  placeholder="0.00"
                  value={
                    swapResult ? formatTokenAmount(swapResult.toAmount) : ""
                  }
                  readOnly
                  aria-describedby="to-usd"
                />
                {swapResult && (
                  <span id="to-usd" className={styles.usdValue}>
                    ≈ {formatUSD(swapResult.toValueUsd)}
                  </span>
                )}
              </div>
              <TokenSelector
                id="to-token"
                label="Destination token"
                selectedToken={toToken}
                onSelect={setToToken}
                excludeToken={fromToken}
              />
            </div>
          </fieldset>

          {/* Rate Info */}
          {swapResult && fromToken && toToken && (
            <div className={styles.rateInfo}>
              <button
                type="button"
                className={styles.rateToggle}
                onClick={() => setRateExpanded(!rateExpanded)}
                aria-expanded={rateExpanded}
              >
                <div className={styles.rateMain}>
                  <span className={styles.rateValue}>
                    1 {fromToken.currency} ={" "}
                    {formatTokenAmount(swapResult.rate)} {toToken.currency}
                  </span>
                  <RefreshIcon className={styles.refreshIcon} />
                </div>
                <ChevronIcon
                  className={`${styles.expandIcon} ${
                    rateExpanded ? "" : styles.collapsed
                  }`}
                />
              </button>

              {rateExpanded && (
                <div className={styles.rateDetails}>
                  <div className={styles.rateRow}>
                    <span className={styles.rateLabel}>Price Impact</span>
                    <span
                      className={`${styles.rateValueDetail} ${
                        swapResult.priceImpact > 1
                          ? styles.negative
                          : swapResult.priceImpact > 0.5
                          ? styles.warning
                          : styles.positive
                      }`}
                    >
                      ~{swapResult.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className={styles.rateRow}>
                    <span className={styles.rateLabel}>Minimum Received</span>
                    <span className={styles.rateValueDetail}>
                      {formatTokenAmount(swapResult.minReceived)}{" "}
                      {toToken.currency}
                    </span>
                  </div>
                  <div className={styles.rateRow}>
                    <span className={styles.rateLabel}>Slippage Tolerance</span>
                    <span className={styles.rateValueDetail}>
                      {CONSTANTS.SLIPPAGE_TOLERANCE}%
                    </span>
                  </div>
                  <div className={styles.rateRow}>
                    <span className={styles.rateLabel}>Network Fee</span>
                    <span className={styles.rateValueDetail}>~$0.50</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.swapButton}
            disabled={!canSwap || isLoading}
          >
            <span className={styles.buttonText}>{buttonText}</span>
            {isLoading && <span className={styles.buttonLoader} />}
          </button>
        </form>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay isOpen={isLoading} />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        fromToken={fromToken}
        toToken={toToken}
        fromAmount={fromAmount}
        toAmount={successData?.toAmount || "0"}
        rate={successData?.rate || 0}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showError}
        onClose={handleErrorClose}
        message={error || CONSTANTS.ERRORS.SWAP_FAILED}
      />
    </>
  );
}
