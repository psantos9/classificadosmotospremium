export const firstDayOfNextMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 1)
