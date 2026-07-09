/**
 * Converte minuti dalla mezzanotte in stringa oraria "HH:MM"
 */
export function minutesToTime(minutes) {
  const m = Math.max(0, Math.min(1439, minutes));
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/**
 * Converte stringa oraria "HH:MM" in minuti dalla mezzanotte
 */
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Arrotonda i minuti allo slot di 30 minuti più vicino
 */
export function snapToSlot(minutes) {
  return Math.round(minutes / 30) * 30;
}

/**
 * Formatta una durata in minuti come stringa leggibile
 */
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Restituisce i minuti dalla mezzanotte per l'ora corrente
 */
export function getCurrentTimeMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Restituisce il giorno della settimana corrente (0 = Lunedì, 6 = Domenica)
 */
export function getCurrentDayIndex() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}
