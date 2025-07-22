export default function formatMoney(value: number | string | undefined | null, locale = 'en-US'): string {
  if (value === null || value === undefined || isNaN(Number(value))) return '';

  return Number(value).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
