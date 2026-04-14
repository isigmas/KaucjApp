export const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

export const formatCurrency = (amount: number, currency = "PLN") => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};
