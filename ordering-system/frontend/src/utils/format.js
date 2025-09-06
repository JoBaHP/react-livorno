export function formatCurrency(value, locale = 'en') {
  const number = Number(value || 0);
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(number);
    return `${formatted}din`;
  } catch (e) {
    return `${Math.round(number)}din`;
  }
}

