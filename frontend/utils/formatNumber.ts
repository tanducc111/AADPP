export function formatNumber(numericValue: number, locale = "en-US") {
  return new Intl.NumberFormat(locale).format(numericValue);
}

export function formatPercentage(decimalValue: number, locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    style: "percent",
  }).format(decimalValue);
}
