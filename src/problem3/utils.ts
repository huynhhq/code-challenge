import type {
  PriceMap,
  Blockchain,
  WalletBalance,
  FormattedWalletBalance,
} from "./types";
import { BLOCKCHAIN_PRIORITIES, DEFAULT_PRIORITY } from "./constants";

/**
 * Get the display priority for a blockchain
 * Higher priority blockchains appear first in the list
 */
export const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] ?? DEFAULT_PRIORITY;
};

/**
 * Check if a balance should be displayed
 * Only show balances with positive amounts and valid blockchain priority
 */
export const isValidBalance = (balance: WalletBalance): boolean => {
  const priority = getPriority(balance.blockchain);
  return balance.amount > 0 && priority > DEFAULT_PRIORITY;
};

/**
 * Sort balances by blockchain priority (descending)
 */
export const compareByPriority = (
  a: WalletBalance,
  b: WalletBalance
): number => {
  const priorityA = getPriority(a.blockchain);
  const priorityB = getPriority(b.blockchain);
  return priorityB - priorityA;
};

/**
 * Format a balance for display
 */
export const formatBalance = (
  balance: WalletBalance,
  prices: PriceMap
): FormattedWalletBalance => ({
  ...balance,
  formatted: balance.amount.toFixed(2),
  usdValue: (prices[balance.currency] ?? 0) * balance.amount,
});

/**
 * Generate unique key for a balance row
 */
export const getRowKey = (balance: FormattedWalletBalance): string => {
  return `${balance.blockchain}-${balance.currency}`;
};
