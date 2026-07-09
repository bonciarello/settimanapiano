export const DAYS_OF_WEEK = [
  'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì',
  'Venerdì', 'Sabato', 'Domenica'
];

export const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const SLOT_HEIGHT = 28;
export const TIME_LABEL_WIDTH = 52;
export const MIN_BLOCK_DURATION = 30;

export const BLOCK_COLORS = [
  { name: 'Corallo', value: '#FF6B6B' },
  { name: 'Arancio', value: '#FF8E53' },
  { name: 'Oro', value: '#FFD43B' },
  { name: 'Menta', value: '#69DB7C' },
  { name: 'Acquamarina', value: '#38D9A9' },
  { name: 'Azzurro', value: '#4DABF7' },
  { name: 'Blu', value: '#748FFC' },
  { name: 'Viola', value: '#B197FC' },
  { name: 'Rosa', value: '#F783AC' },
  { name: 'Grigio', value: '#ADB5BD' },
];

export const DEFAULT_COLOR = BLOCK_COLORS[5].value;
