/**
 * Restituisce il lunedì della settimana che contiene la data
 */
export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Aggiunge n settimane a una data
 */
export function addWeeks(date, weeks) {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

/**
 * Formatta l'intervallo della settimana
 */
export function formatWeekRange(monday) {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const fmt = (d) =>
    d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} – ${fmt(sunday)} ${monday.getFullYear()}`;
}

/**
 * Verifica se una data è oggi
 */
export function isTodayDate(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
