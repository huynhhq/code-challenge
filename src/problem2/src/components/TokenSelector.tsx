import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type KeyboardEvent,
} from "react";

// Types
import type { Token, TokenSelectorProps } from "../types";

// Context
import { useTokenContext } from "../context";

// Hooks
import { useDropdown, useDebounce } from "../hooks";

// Utils
import { formatUSD } from "../utils";

// Constants
import { CONSTANTS } from "../constants";

// Components
import { ChevronIcon, SearchIcon } from "./Icons";

// Styles
import styles from "../styles/TokenSelector.module.css";

export function TokenSelector({
  id,
  label,
  excludeToken,
  selectedToken,
  onSelect,
}: TokenSelectorProps) {
  const { searchTokens } = useTokenContext();
  const { isOpen, toggle, close, containerRef } = useDropdown();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const debouncedQuery = useDebounce(searchQuery, CONSTANTS.DEBOUNCE_DELAY);

  const filteredTokens = searchTokens(debouncedQuery).filter(
    (token) => token.currency !== excludeToken?.currency
  );

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (token: Token) => {
      onSelect(token);
      close();
    },
    [onSelect, close]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;

    const options =
      listRef.current?.querySelectorAll<HTMLLIElement>('li[tabindex="0"]');
    if (!options) return;

    const focusedIndex = Array.from(options).findIndex(
      (opt) => opt === document.activeElement
    );

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (focusedIndex < options.length - 1) {
          options[focusedIndex + 1]?.focus();
        } else if (focusedIndex === -1 && options.length > 0) {
          options[0]?.focus();
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (focusedIndex > 0) {
          options[focusedIndex - 1]?.focus();
        }
        break;
      case "Enter":
        event.preventDefault();
        if (focusedIndex >= 0 && filteredTokens[focusedIndex]) {
          handleSelect(filteredTokens[focusedIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = CONSTANTS.FALLBACK_TOKEN_ICON;
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      data-open={isOpen}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        id={id}
        className={styles.trigger}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}: ${selectedToken?.currency || "Select token"}`}
      >
        {selectedToken ? (
          <>
            <img
              src={selectedToken.image}
              alt={selectedToken.currency}
              className={styles.tokenIcon}
              onError={handleImageError}
            />
            <div className={styles.tokenInfo}>
              <span className={styles.tokenSymbol}>
                {selectedToken.currency}
              </span>
              <span className={styles.tokenName}>
                {selectedToken.name || selectedToken.currency}
              </span>
            </div>
          </>
        ) : (
          <span className={styles.placeholder}>Select token</span>
        )}
        <ChevronIcon
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox" aria-label={label}>
          <div className={styles.search}>
            <div className={styles.searchWrapper}>
              <SearchIcon className={styles.searchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tokens"
              />
            </div>
          </div>

          <ul ref={listRef} className={styles.list}>
            {filteredTokens.length === 0 ? (
              <li className={styles.empty}>No tokens found</li>
            ) : (
              filteredTokens.map((token) => {
                const isSelected = selectedToken?.currency === token.currency;
                return (
                  <li
                    key={token.currency}
                    className={styles.listItem}
                    onClick={() => handleSelect(token)}
                    role="option"
                    aria-selected={isSelected}
                    data-selected={isSelected}
                    tabIndex={0}
                  >
                    <img
                      src={token.image}
                      alt={token.currency}
                      className={styles.listItemIcon}
                      onError={handleImageError}
                      loading="lazy"
                    />
                    <div className={styles.listItemInfo}>
                      <span className={styles.listItemSymbol}>
                        {token.currency}
                      </span>
                      <span className={styles.listItemName}>
                        {token.name || token.currency}
                      </span>
                    </div>
                    <span className={styles.listItemPrice}>
                      {formatUSD(token.price)}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
