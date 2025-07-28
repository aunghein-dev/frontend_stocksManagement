
/**
 * Formats a date string into a readable format (e.g., "August 31, 2023").
 * Returns "N/A" if the date is invalid or undefined.
 */
export function formatReadableDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString; // Fallback to original string if error
  }
}

/**
 * Formats a number as currency in MMK.
 * Returns "N/A" if the amount is undefined or null.
 */
export function formatCurrencyMMK(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return 'N/A';
  return `MMK ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}