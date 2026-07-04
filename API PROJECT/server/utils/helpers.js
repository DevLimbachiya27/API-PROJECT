// Format month number to month name
const getMonthName = (monthNum) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNum - 1] || 'Unknown';
};

// Calculate penalty based on days overdue
const calculatePenalty = (dueDate, amount) => {
  const today = new Date();
  const due = new Date(dueDate);

  if (today <= due) return 0;

  const daysLate = Math.ceil((today - due) / (1000 * 60 * 60 * 24));

  // 2% penalty per week, capped at 20%
  const weeksPenalty = Math.ceil(daysLate / 7) * 0.02;
  const penaltyRate = Math.min(weeksPenalty, 0.20);

  return Math.round(amount * penaltyRate);
};

// Generate invoice number
const generateInvoiceNumber = (wing, flatNumber, month, year) => {
  const paddedMonth = String(month).padStart(2, '0');
  return `INV-${wing}${flatNumber}-${paddedMonth}${year}`;
};

// Check if time slots overlap
const isTimeOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

// Format date to readable string
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

module.exports = {
  getMonthName,
  calculatePenalty,
  generateInvoiceNumber,
  isTimeOverlap,
  formatDate
};
