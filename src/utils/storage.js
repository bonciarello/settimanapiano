const STORAGE_PREFIX = 'settimanapiano_';

function getWeekKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const startOfYear = new Date(y, 0, 1);
  const days = Math.floor((d - startOfYear) / (1000 * 60 * 60 * 24));
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${STORAGE_PREFIX}${y}-w${String(weekNum).padStart(2, '0')}`;
}

export function saveWeek(date, activities) {
  try {
    localStorage.setItem(getWeekKey(date), JSON.stringify(activities));
  } catch (e) {
    console.error('Errore salvataggio localStorage:', e);
  }
}

export function loadWeek(date) {
  try {
    const data = localStorage.getItem(getWeekKey(date));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Errore caricamento localStorage:', e);
    return [];
  }
}

export function clearAllData() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.error('Errore pulizia localStorage:', e);
  }
}
