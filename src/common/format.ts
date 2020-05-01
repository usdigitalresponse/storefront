import numeral from 'numeral';

export function formatCurrency(n: number): string {
  if (n == null) return '';

  return numeral(n).format('$0,0.00');
}

export function formatPercentage(n: number): string {
  if (n == null) return '';

  return numeral(n).format('0,0.0%');
}
