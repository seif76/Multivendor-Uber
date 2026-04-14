// utils/currency.js
export const GLOBAL_CURRENCY_CODE = 'LYD'; 


export const formatCurrency = (amount) => {
  // Make sure it's a valid number, fallback to 0 if not
  const numericAmount = Number(amount) || 0;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: GLOBAL_CURRENCY_CODE,
    // You can set these to 0 if you don't want decimals (e.g., $10 instead of $10.00)
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2,
  }).format(numericAmount);
};