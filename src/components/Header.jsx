import { getWeekStart, formatWeekRange } from '../utils/weekUtils';

export default function Header({
  weekRange,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onAddBlock,
  isCurrentWeek,
}) {
  return (
    <header className="app-header">
      <div className="app-header__left">
        <h1 className="app-header__title">
          Settimana<span>Piano</span>
        </h1>
        <span className="app-header__subtitle">Planner visivo a blocchi</span>
      </div>

      <div className="app-header__center">
        <nav className="week-nav" aria-label="Navigazione settimana">
          <button
            className="week-nav__btn"
            onClick={onPrevWeek}
            aria-label="Settimana precedente"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>
          <span className="week-nav__label">{weekRange}</span>
          <button
            className="week-nav__btn"
            onClick={onNextWeek}
            aria-label="Settimana successiva"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
          {!isCurrentWeek && (
            <button className="week-nav__today" onClick={onCurrentWeek}>
              Oggi
            </button>
          )}
        </nav>
      </div>

      <div className="app-header__right">
        <button className="btn btn--primary" onClick={onAddBlock}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Nuova attività
        </button>
      </div>
    </header>
  );
}
