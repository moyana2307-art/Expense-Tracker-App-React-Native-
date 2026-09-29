export function formatCurrency(value, currency = 'USD') {
  const amount = Number(value) || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function formatCompactCurrency(value, currency = 'USD') {
  const amount = Number(value) || 0;
  if (Math.abs(amount) >= 1000) {
    return `${amount < 0 ? '-' : ''}${currencySymbol(currency)}${(Math.abs(amount) / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount, currency);
}

export function currencySymbol(currency = 'USD') {
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$' };
  return symbols[currency] || '$';
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function toISODate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function formatDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = String(isoDate).split('-').map(Number);
  if (!year || !month || !day) return String(isoDate);
  return `${day} ${MONTHS[month - 1].slice(0, 3)} ${year}`;
}

export function formatDayHeading(isoDate) {
  const today = toISODate(new Date());
  if (isoDate === today) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isoDate === toISODate(yesterday)) return 'Yesterday';

  const [year, month] = isoDate.split('-').map(Number);
  return `${dayName(year, month - 1, Number(isoDate.split('-')[2]))}, ${MONTHS[month - 1]} ${year}`;
}

function dayName(year, monthIndex, day) {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date(year, monthIndex, day).getDay()
  ];
}

export function monthKey(isoDate) {
  return String(isoDate).slice(0, 7);
}

export function monthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

export function currentMonthKey() {
  return monthKey(toISODate(new Date()));
}

export function monthRange(key) {
  return { start: `${key}-01`, end: `${key}-31` };
}

export function relativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(toISODate(new Date(timestamp)));
}
