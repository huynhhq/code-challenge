export interface Token {
  currency: string;
  name?: string;
  image: string;
  price: number;
  date: string;
}

export interface TokenPriceData {
  currency: string;
  date: string;
  price: number;
}

export interface SwapResult {
  fromAmount: number;
  toAmount: number;
  rate: number;
  toValueUsd: number;
  priceImpact: number;
  minReceived: number;
  fromValueUsd: number;
}

export interface SwapState {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  isLoading: boolean;
  error: string | null;
}

export interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  excludeToken?: Token | null;
  label: string;
  id: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface SwapSuccessData {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  rate: number;
}
