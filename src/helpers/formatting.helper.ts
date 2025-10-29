
export const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0';
  }
  return amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};
