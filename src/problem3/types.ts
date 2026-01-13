export type Blockchain =
  | "Osmosis"
  | "Ethereum"
  | "Arbitrum"
  | "Zilliqa"
  | "Neo";

export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

export type PriceMap = Record<string, number>;

export interface WalletPageProps {
  className?: string;
}

export interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}
