import React, { useMemo } from "react";

// Types
import type { WalletPageProps, FormattedWalletBalance } from "./types";

// Utils
import {
  getRowKey,
  isValidBalance,
  formatBalance,
  compareByPriority,
} from "./utils";

// Hooks
import { useWalletBalances, usePrices } from "./hooks";

// Components
import { WalletRow } from "./components";

const WalletPage: React.FC<WalletPageProps> = ({ className, ...rest }) => {
  const prices = usePrices();
  const balances = useWalletBalances();

  const formattedBalances = useMemo((): FormattedWalletBalance[] => {
    return balances
      .filter(isValidBalance)
      .sort(compareByPriority)
      .map((balance) => formatBalance(balance, prices));
  }, [balances, prices]);

  return (
    <div className={className} {...rest}>
      {formattedBalances.map((balance) => (
        <WalletRow
          key={getRowKey(balance)}
          className="wallet-row"
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};

export default WalletPage;
