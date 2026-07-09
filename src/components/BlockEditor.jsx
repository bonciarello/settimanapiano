import { useState, useEffect } from 'react';
import { DAYS_OF_WEEK, BLOCK_COLORS } from '../constants';
import { minutesToTime, timeToMinutes } from '../utils/timeUtils';

const DURATION_OPTIONS = [
  { label: '30 minuti', value: 30 },
  { label: '1 ora', value: 60 },
  { label: '1 ora e 30', value: 90 },
  { label: '2 ore', value: 120 },
  { label: '2 ore e 30', value: 150 },
  { label: '3 ore', value: 180 },
  { label: '4 ore', value: 240 },
  { label: '6 ore', value: 360 },
  { label: '8 ore', value: 480 },
];

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

export default function BlockEditor({
  block,
  isNew,
  initialData,
  onSave,
  onDelete,
  onClose,
}) {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(0);
  const [startTime, setStartTime] = useState('08:00');
  const [duration, setDuration] = useState(60);
  const [color, setColor] = useState(BLOCK_COLORS[5].value);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (block && !isNew) {
      setTitle(block.title || '');
      setDay(block.day ?? 0);
      setStartTime(minutesToTime(block.startTime ?? 480));
      setDuration(block.duration ?? 60);
      setColor(block.color || BLOCK_COLORS[5].value);
      setNotes(block.notes || '');
    } else if (isNew && initialData) {
      setTitle('');
      setDay(initialData.day ?? 0);
      setStartTime(minutesToTime(initialData.startTime ?? 480));
      setDuration(60);
      setColor(BLOCK_COLORS[5].value);
      setNotes('');
    }
  }, [block, isNew, initialData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Inserisci un titolo per l\'attività';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const startMin = timeToMinutes(startTime);
    const maxDuration = 1440 - startMin;

    onSave({
      ...(block && !isNew ? { id: block.id } : {}),
      title: title.trim(),
      day,
      startTime: startMin,
      duration: Math.min(duration, maxDuration),
      color,
      notes: notes.trim(),
    });
  };

  const handleDelete = () => {
    if (block && !isNew && onDelete) {
      onDelete(block.id);
    }
    onClose();
  };

  const previewTitle = title.trim() || 'Nuova attività';

  return (
    <div className="editor-overlay" onClick={onClose}>
      <div
        className="editor-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={isNew ? 'Nuova attività' : 'Modifica attività'}
        aria-modal="true"
      >
        <div className="editor-panel__header">
          <h2 className="editor-panel__title">
            {isNew ? 'Nuova attività' : 'Modifica attività'}
          </h2>
          <button
            className="editor-panel__close"
            onClick={onClose}
            aria-label="Chiudi"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5l10 10M15 5l-10 10" />
            </svg>
          </button>
        </div>

        <div className="editor-panel__body">
          <div
            className="editor-panel__preview"
            style={{ '--block-color': color, backgroundColor: `${color}18`, borderLeftColor: color }}
          >
            <span className="editor-panel__preview-title">{previewTitle}</span>
            <span className="editor-panel__preview-time">
              {startTime} – {minutesToTime(timeToMinutes(startTime) + duration)}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="block-title">Titolo</label>
            <input
              id="block-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={validate}
              placeholder="Es. Lezione di matematica"
              className={errors.title ? 'input--error' : ''}
              autoFocus
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="block-day">Giorno</label>
              <select
                id="block-day"
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
              >
                {DAYS_OF_WEEK.map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="block-time">Ora inizio</label>
              <select
                id="block-time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="block-duration">Durata</label>
              <select
                id="block-duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Colore
              </legend>
              <div className="color-picker" role="radiogroup" aria-label="Colore blocco">
                {BLOCK_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`color-swatch${color === c.value ? ' color-swatch--active' : ''}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setColor(c.value)}
                    aria-label={c.name}
                    title={c.name}
                    role="radio"
                    aria-checked={color === c.value}
                    type="button"
                  />
                ))}
              </div>
            </fieldset>
          </div>

          <div className="form-group">
            <label htmlFor="block-notes">Note</label>
            <textarea
              id="block-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aggiungi dettagli, luogo, materiali…"
              rows={3}
            />
          </div>
        </div>

        <div className="editor-panel__footer">
          {block && !isNew && (
            <button className="btn btn--danger" onClick={handleDelete} type="button">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9h8l1-9" />
              </svg>
              Elimina
            </button>
          )}
          <div className="editor-panel__footer-right">
            <button className="btn btn--secondary" onClick={onClose} type="button">
              Annulla
            </button>
            <button className="btn btn--primary" onClick={handleSave} type="button">
              {isNew ? 'Crea attività' : 'Salva modifiche'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
