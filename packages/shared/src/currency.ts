export function penceToPounds(pence: number): string {
  const pounds = pence / 100;
  const sign = pounds < 0 ? '-' : '';
  const formatted = Math.abs(pounds).toFixed(2);
  return `${sign}£${formatted}`;
}

export function poundsToPence(pounds: string): number {
  const cleaned = pounds.replace('£', '').trim();
  return Math.round(parseFloat(cleaned) * 100);
}

export function formatBudget(pence: number): string {
  const pounds = pence / 100;
  const sign = pounds < 0 ? '-' : '';
  const abs = Math.abs(pounds);
  const parts = abs.toFixed(2).split('.');
  const intPart = parts[0];
  const decPart = parts[1];

  // Add commas to the integer part
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${sign}£${withCommas}.${decPart}`;
}
