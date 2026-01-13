# Code Review Notes

## Issues Found

### Critical Bugs

**1. Wrong variable name in the filter**
```tsx
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) {  // this will crash - lhsPriority doesn't exist
```
Looks like a copy-paste error. Should be `balancePriority`.

**2. TypeScript interface is incomplete**
```tsx
interface WalletBalance {
  currency: string;
  amount: number;
  // missing blockchain property but it's used everywhere
}
```
The code uses `balance.blockchain` but it's not in the interface. Surprised TypeScript didn't complain.

**3. Filter logic is backwards**
```tsx
if (balance.amount <= 0) {
  return true;  // keeps empty balances?
}
```
This filters OUT balances with money and keeps the empty ones. Pretty sure that's not what we want.

**4. Type mismatch in the render**
```tsx
const rows = sortedBalances.map((balance: FormattedWalletBalance, ...) => {
  formattedAmount={balance.formatted}  // .formatted doesn't exist here
```
`sortedBalances` is `WalletBalance[]` but the code treats it like `FormattedWalletBalance[]`. This won't work.

**5. Missing classes object**
```tsx
className={classes.row}  // where does classes come from?
```
`classes` is never defined or imported anywhere.

### Performance & Code Quality Issues

**6. Function recreated on every render**
```tsx
const WalletPage: React.FC<Props> = (props: Props) => {
  const getPriority = (blockchain: any): number => { ... }
```
Not a huge deal but this should be outside the component.

**7. Using `any` type**
```tsx
const getPriority = (blockchain: any): number => {
```
Why use TypeScript if we're just going to use `any`? Should be a proper union type.

**8. Wrong useMemo dependencies**
```tsx
}, [balances, prices]);  // prices isn't used in this memo
```
Including `prices` here causes unnecessary recalculations. The first memo doesn't use prices at all.

**9. Dead code**
```tsx
const formattedBalances = sortedBalances.map(...);  // computed but never used

const rows = sortedBalances.map(...);  // uses sortedBalances instead
```
Why compute `formattedBalances` if we're not going to use it?

**10. Using index as key**
```tsx
key={index}
```
Classic React anti-pattern. Should use something unique like `${blockchain}-${currency}`.

**11. Incomplete sort function**
```tsx
if (leftPriority > rightPriority) {
  return -1;
} else if (rightPriority > leftPriority) {
  return 1;
}
// no return 0 for equal case
```
Should explicitly return 0 when priorities are equal.

**12. Unused destructured variable**
```tsx
const { children, ...rest } = props;  // children is never used
```
Either use it or don't destructure it.

**13. Pointless interface**
```tsx
interface Props extends BoxProps {
  // literally nothing added
}
```
Just use `BoxProps` directly if we're not adding anything.

**14. Multiple array iterations**
```tsx
const sortedBalances = useMemo(() => balances.filter(...).sort(...), ...);
const formattedBalances = sortedBalances.map(...);
const rows = sortedBalances.map(...);
```
Could combine filter + sort + map into one pass.

## How I Fixed It

- Moved utility functions outside the component
- Fixed all the type definitions (added proper Blockchain union type)
- Combined the filter/sort/format into a single useMemo with correct dependencies
- Used proper unique keys for list items
- Removed all the dead code
- Fixed the backwards filter logic

Check `WalletPage.tsx` for the cleaned up version.
