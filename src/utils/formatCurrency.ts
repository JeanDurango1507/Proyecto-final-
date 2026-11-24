export const formatCurrency = (value: number): string => {
  const safePositive = Math.max(0, Math.round(Math.abs(value)));
  return safePositive.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};