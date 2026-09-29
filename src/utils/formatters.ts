export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
}

export function calculateNights(departureDate: string, returnDate: string): number {
  if (!departureDate || !returnDate) return 4;
  const start = new Date(departureDate);
  const end = new Date(returnDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

export function formatDateRange(departureDate: string, returnDate: string): string {
  if (!departureDate || !returnDate) return 'Flexible Dates';
  const start = new Date(departureDate);
  const end = new Date(returnDate);
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', options);
  const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' });
  return `${startStr} - ${endStr}`;
}
