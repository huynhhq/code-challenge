import { useState, useCallback, useMemo } from "react";

// Types
import type { Token, SwapResult, SwapState } from "../types";

// Constants
import { CONSTANTS } from "../constants";

// Utils
import { isValidAmount } from "../utils";

/**
 * Custom hook for managing swap logic
 */
export function useSwap() {
  const [state, setState] = useState<SwapState>({
    fromToken: null,
    toToken: null,
    fromAmount: "",
    toAmount: "",
    isLoading: false,
    error: null,
  });

  /**
   * Calculate swap result
   */
  const swapResult = useMemo((): SwapResult | null => {
    const { fromToken, toToken, fromAmount } = state;

    if (!fromToken || !toToken || !isValidAmount(fromAmount)) {
      return null;
    }

    const amount = parseFloat(fromAmount);
    const fromValueUsd = amount * fromToken.price;
    const rate = fromToken.price / toToken.price;
    const toAmount = amount * rate;
    const toValueUsd = toAmount * toToken.price;

    let priceImpact = 0.01;
    if (fromValueUsd >= 1000) priceImpact = 0.05;
    if (fromValueUsd >= 10000) priceImpact = 0.1;
    if (fromValueUsd >= 100000) priceImpact = 0.5;
    if (fromValueUsd >= 1000000) priceImpact = 1.0;

    const minReceived = toAmount * (1 - CONSTANTS.SLIPPAGE_TOLERANCE / 100);

    return {
      fromAmount: amount,
      toAmount,
      fromValueUsd,
      toValueUsd,
      rate,
      priceImpact,
      minReceived,
    };
  }, [state.fromToken, state.toToken, state.fromAmount]);

  /**
   * Set the "from" token
   */
  const setFromToken = useCallback((token: Token | null) => {
    setState((prev) => ({ ...prev, fromToken: token }));
  }, []);

  /**
   * Set the "to" token
   */
  const setToToken = useCallback((token: Token | null) => {
    setState((prev) => ({ ...prev, toToken: token }));
  }, []);

  /**
   * Set the "from" amount
   */
  const setFromAmount = useCallback((amount: string) => {
    setState((prev) => ({ ...prev, fromAmount: amount }));
  }, []);

  /**
   * Swap token positions
   */
  const swapTokenPositions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
    }));
  }, []);

  /**
   * Execute the swap (simulated)
   */
  const executeSwap = useCallback(async (): Promise<boolean> => {
    const { fromToken, toToken, fromAmount } = state;

    if (!fromToken || !toToken || !isValidAmount(fromAmount)) {
      setState((prev) => ({ ...prev, error: "Invalid swap parameters" }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, CONSTANTS.SWAP_DELAY));

      if (Math.random() < 0.1) {
        throw new Error("Transaction failed. Please try again.");
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Swap failed";
      setState((prev) => ({ ...prev, error: message }));
      return false;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state]);

  /**
   * Reset the swap form
   */
  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      fromAmount: "",
      toAmount: "",
      error: null,
    }));
  }, []);

  /**
   * Validate if swap can be executed
   */
  const canSwap = useMemo(() => {
    const { fromToken, toToken, fromAmount, isLoading } = state;
    return (
      !isLoading &&
      fromToken !== null &&
      toToken !== null &&
      isValidAmount(fromAmount) &&
      parseFloat(fromAmount) <= CONSTANTS.MAX_AMOUNT
    );
  }, [state]);

  /**
   * Get button text based on current state
   */
  const buttonText = useMemo(() => {
    const { fromToken, toToken, fromAmount, isLoading } = state;

    if (isLoading) return "Swapping...";
    if (!fromToken && !toToken) return "Select tokens to swap";
    if (!fromToken) return "Select source token";
    if (!toToken) return "Select destination token";
    if (!fromAmount || !isValidAmount(fromAmount)) return "Enter an amount";
    if (parseFloat(fromAmount) > CONSTANTS.MAX_AMOUNT)
      return "Amount too large";
    return "Swap";
  }, [state]);

  return {
    // State
    fromToken: state.fromToken,
    toToken: state.toToken,
    fromAmount: state.fromAmount,
    isLoading: state.isLoading,
    error: state.error,
    swapResult,
    canSwap,
    buttonText,

    // Actions
    setFromToken,
    setToToken,
    setFromAmount,
    swapTokenPositions,
    executeSwap,
    reset,
  };
}
