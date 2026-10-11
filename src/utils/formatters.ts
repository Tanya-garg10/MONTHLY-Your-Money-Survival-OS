export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const formatted = abs.toLocaleString('en-IN');
  return isNegative ? `-₹${formatted}` : `₹${formatted}`;
}

export function formatINRCompact(amount: number): string {
  if (isNaN(amount)) return '₹0';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  
  let result: string;
  if (abs >= 100000) {
    result = `${(abs / 100000).toFixed(1)}L`;
  } else if (abs >= 1000) {
    result = `${(abs / 1000).toFixed(1)}k`;
  } else {
    result = `${Math.round(abs)}`;
  }
  return isNegative ? `-₹${result}` : `₹${result}`;
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return '0%';
  return `${Math.round(value)}%`;
}

export function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
