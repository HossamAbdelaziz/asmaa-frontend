// src/utils/currencyConverter.jsx

// Exchange rates (you can update these regularly or fetch from an API)
const EXCHANGE_RATES = {
  CAD: {
    AED: 2.75, // 1 CAD = 2.75 AED (approximate)
    SAR: 2.81, // 1 CAD = 2.81 SAR (approximate)
  }
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (typeof amount !== 'number' || isNaN(amount)) return 0;
  if (fromCurrency === toCurrency) return amount;
  const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency];
  if (!rate) return amount;
  return Math.round(amount * rate);
};

export const formatCurrency = (amount, currency) => {
  if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount)) return '-';
  const currencySymbols = {
    CAD: 'C$',
    AED: 'AED',
    SAR: 'SAR'
  };
  const symbol = currencySymbols[currency] || currency;
  let formattedAmount = '-';
  try {
    formattedAmount = amount.toLocaleString();
  } catch (e) {
    formattedAmount = '-';
  }
  return `${symbol} ${formattedAmount}`;
};

export const getCurrencyDisplay = (cadAmount) => {
  if (cadAmount === undefined || cadAmount === null || typeof cadAmount !== 'number' || isNaN(cadAmount)) {
    return { CAD: '-', AED: '-', SAR: '-' };
  }
  const aedAmount = convertCurrency(cadAmount, 'CAD', 'AED');
  const sarAmount = convertCurrency(cadAmount, 'CAD', 'SAR');
  return {
    CAD: formatCurrency(cadAmount, 'CAD'),
    AED: formatCurrency(aedAmount, 'AED'),
    SAR: formatCurrency(sarAmount, 'SAR')
  };
}; 