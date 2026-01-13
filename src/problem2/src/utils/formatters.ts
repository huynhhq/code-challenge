/**
 * Format a number with thousands separators
 */
export function formatNumber(value: number, maxDecimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a value as USD currency
 */
export function formatUSD(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }

  // For very small values, show more decimals
  if (value > 0 && value < 0.01) {
    return `$${value.toFixed(6)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a token amount with appropriate precision
 */
export function formatTokenAmount(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  // For very large numbers, use compact notation
  if (value >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  }

  // For numbers >= 1000, show 2 decimals
  if (value >= 1000) {
    return formatNumber(value, 2);
  }

  // For numbers >= 1, show up to 4 decimals
  if (value >= 1) {
    return formatNumber(value, 4);
  }

  // For numbers >= 0.0001, show up to 6 decimals
  if (value >= 0.0001) {
    return formatNumber(value, 6);
  }

  // For very small numbers, show up to 8 decimals
  return formatNumber(value, 8);
}

/**
 * Validate and sanitize amount input
 */
export function sanitizeAmountInput(value: string, maxDecimals = 8): string {
  // Allow only numbers and single decimal point
  let sanitized = value.replace(/[^0-9.]/g, '');

  // Prevent multiple decimal points
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit decimal places
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    sanitized = parts[0] + '.' + parts[1].slice(0, maxDecimals);
  }

  return sanitized;
}

/**
 * Check if a string is a valid positive number
 */
export function isValidAmount(value: string): boolean {
  if (!value || value.trim() === '') return false;
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
