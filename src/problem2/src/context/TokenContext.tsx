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

// Data
import { TOKEN_NAMES } from "../data/tokenData";
import { TOKEN_PRICES } from "../data/tokenPrices";

interface TokenContextValue {
  tokens: Token[];
  isLoading: boolean;
  error: string | null;
  searchTokens: (query: string) => Token[];
  getToken: (currency: string) => Token | undefined;
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
        name: TOKEN_NAMES[currency] || currency,
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

  useEffect(() => {
    const loadTokens = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const priceMap = buildPriceMap(TOKEN_PRICES);
        const tokenList = buildTokenList(priceMap);

        setTokens(tokenList);
      } catch (err) {
        console.error("Failed to load tokens:", err);
        setError("Failed to load token data");
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, []);

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
    }),
    [tokens, isLoading, error, searchTokens, getToken]
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
