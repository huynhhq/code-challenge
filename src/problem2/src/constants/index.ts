export const CONSTANTS = {
  TOKEN_ICONS_BASE_URL:
    "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens",
  PRICES_API_URL: "https://interview.switcheo.com/prices.json",
  FALLBACK_TOKEN_ICON:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b6b78'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='white' font-size='10' font-family='Arial'%3E?%3C/text%3E%3C/svg%3E",
  SLIPPAGE_TOLERANCE: 0.5,
  MAX_DECIMALS: 8,
  MAX_AMOUNT: 1000000000,
  DEBOUNCE_DELAY: 150,
  SWAP_DELAY: 2000,
  ERRORS: {
    TOKEN_REQUIRED: "Please select a token",
    AMOUNT_REQUIRED: "Please enter a valid amount",
    AMOUNT_TOO_LARGE: "Amount exceeds maximum limit",
    SWAP_FAILED: "Swap failed. Please try again.",
    NETWORK_ERROR: "Network error. Please check your connection.",
  },
} as const;

export type Constants = typeof CONSTANTS;
