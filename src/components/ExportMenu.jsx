import { useState, useRef, useEffect } from 'react';
import { DAYS_OF_WEEK } from '../constants';
import { minutesToTime, formatDuration } from '../utils/timeUtils';

export default function ExportMenu({ activities, weekRange, gridRef }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleExportText = () => {
    const byDay = Array.from({ length: 7 }, () => []);
    for (const a of activities) {
      if (a.day >= 0 && a.day < 7) byDay[a.day].push(a);
    }
    for (const dayBlocks of byDay) {
      dayBlocks.sort((a, b) => a.startTime - b.startTime);
    }

    let text = `RIEPILOGO SETTIMANALE\n${weekRange}\n${'═'.repeat(42)}\n\n`;

    for (let i = 0; i < 7; i++) {
      text += `▸ ${DAYS_OF_WEEK[i].toUpperCase()}\n${'─'.repeat(24)}\n`;
      if (byDay[i].length === 0) {
        text += '  (nessuna attività)\n';
      } else {
        for (const a of byDay[i]) {
          const end = minutesToTime(a.startTime + a.duration);
          text += `  ${minutesToTime(a.startTime)} – ${end}  │  ${a.title}`;
          text += `  (${formatDuration(a.duration)})\n`;
          if (a.notes) {
            text += `    📝 ${a.notes}\n`;
          }
        }
      }
      text += '\n';
    }

    text += `${'═'.repeat(42)}\nEsportato con SettimanaPiano\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `riepilogo-settimana.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleExportImage = async () => {
    const targetEl = gridRef?.current;
    if (!targetEl) {
      setIsOpen(false);
      return;
    }

    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;

      const clone = targetEl.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = targetEl.scrollWidth + 'px';
      clone.style.height = targetEl.scrollHeight + 'px';
      clone.style.overflow = 'visible';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        width: clone.scrollWidth,
        height: clone.scrollHeight,
      });

      document.body.removeChild(clone);

      const url = canvas.toDataURL('image/png');
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `settimanapiano-${Date.now()}.png`;
      anchor.click();
    } catch (err) {
      console.error('Errore nell\'esportazione immagine:', err);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="export-menu" ref={menuRef}>
      <button
        className="btn btn--ghost export-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 10l6 4 6-4" />
          <path d="M8 14V2" />
        </svg>
        Esporta
      </button>

      {isOpen && (
        <div className="export-menu__dropdown" role="menu">
          <button
            className="export-menu__item"
            onClick={handleExportText}
            role="menuitem"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 2h8l3 3v9H3V2z" />
              <path d="M11 2v3h3M5 7h6M5 10h6M5 13h4" />
            </svg>
            Esporta come testo
          </button>
          <button
            className="export-menu__item"
            onClick={handleExportImage}
            disabled={isExporting}
            role="menuitem"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="14" height="10" rx="2" />
              <circle cx="5" cy="6" r="1" />
              <path d="M1 11l3-3 2 2 3-3 4 4" />
            </svg>
            {isExporting ? 'Esportando…' : 'Esporta come immagine'}
          </button>
        </div>
      )}
    </div>
  );
}
