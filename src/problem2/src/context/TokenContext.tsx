import {
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
  type ReactNode,
} from "react";

// Type
import type { Token, TokenPriceData } from "../types";

// Constant
import { CONSTANTS } from "../constants";

interface TokenContextValue {
  tokens: Token[];
  isLoading: boolean;
  error: string | null;
  searchTokens: (query: string) => Token[];
  getToken: (currency: string) => Token | undefined;
  refetchPrices: () => Promise<void>;
}

const TokenContext = createContext<TokenContextValue | null>(null);

function buildPriceMap(
  pricesData: TokenPriceData[]
): Map<string, TokenPriceData> {
  const priceMap = new Map<string, TokenPriceData>();

  pricesData.forEach((item) => {
    if (!item.currency || !item.price || item.price <= 0) {
      return;
    }

    const existing = priceMap.get(item.currency);

    // Keep the most recent price
    if (!existing || new Date(item.date) > new Date(existing.date)) {
      priceMap.set(item.currency, item);
    }
  });

  return priceMap;
}

function buildTokenList(priceMap: Map<string, TokenPriceData>): Token[] {
  const tokens: Token[] = [];

  priceMap.forEach((priceData, currency) => {
    if (priceData.price > 0) {
      tokens.push({
        currency,
        name: currency,
        image: `${CONSTANTS.TOKEN_ICONS_BASE_URL}/${currency}.svg`,
        price: priceData.price,
        date: priceData.date,
      });
    }
  });

  return tokens.sort((a, b) => a.currency.localeCompare(b.currency));
}

interface TokenProviderProps {
  children: ReactNode;
}

export function TokenProvider({ children }: TokenProviderProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch real-time price data from API
      const response = await fetch(CONSTANTS.PRICES_API_URL);

      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.statusText}`);
      }

      const pricesData: TokenPriceData[] = await response.json();
      const priceMap = buildPriceMap(pricesData);
      const tokenList = buildTokenList(priceMap);

      setTokens(tokenList);
    } catch (err) {
      console.error("Failed to load tokens:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load token data"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const searchTokens = useCallback(
    (query: string): Token[] => {
      if (!query || query.trim() === "") {
        return tokens;
      }

      const normalizedQuery = query.toLowerCase().trim();
      return tokens.filter((token) =>
        token.currency.toLowerCase().includes(normalizedQuery)
      );
    },
    [tokens]
  );

  const getToken = useCallback(
    (currency: string): Token | undefined => {
      return tokens.find(
        (token) => token.currency.toLowerCase() === currency.toLowerCase()
      );
    },
    [tokens]
  );

  const value = useMemo(
    () => ({
      tokens,
      isLoading,
      error,
      searchTokens,
      getToken,
      refetchPrices: loadTokens,
    }),
    [tokens, isLoading, error, searchTokens, getToken, loadTokens]
  );

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
}

export function useTokenContext(): TokenContextValue {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokenContext must be used within a TokenProvider");
  }
  return context;
}
