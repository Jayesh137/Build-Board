const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysUntil(targetDate: string, fromDate?: string): number {
  const from = fromDate ? parseISODate(fromDate) : parseISODate(toISOString(new Date()));
  const target = parseISODate(targetDate);
  const diffMs = target.getTime() - from.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: string, today?: string): boolean {
  return daysUntil(dueDate, today) < 0;
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const monthName = MONTHS[month - 1];
  return `${day} ${monthName} ${year}`;
}

export function subtractDays(isoDate: string, days: number): string {
  const date = parseISODate(isoDate);
  date.setDate(date.getDate() - days);
  return toISOString(date);
}
