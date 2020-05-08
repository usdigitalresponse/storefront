import moment from 'moment';
import numeral from 'numeral';

export function formatCurrency(n: number): string {
  if (n == null) return '';
  return numeral(n).format('$0,0.00');
}

export function formatPercentage(n: number): string {
  if (n == null) return '';
  return numeral(n).format('0,0.0%');
}

export function formatDate(timestamp: string): string {
  if (timestamp == null) return '';
  return moment(timestamp).format('MM/DD/YYYY h:mma');
}
