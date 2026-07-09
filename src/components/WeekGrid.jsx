import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  DAYS_SHORT,
  HOURS,
  SLOT_HEIGHT,
  TIME_LABEL_WIDTH,
} from '../constants';
import {
  minutesToTime,
  snapToSlot,
  getCurrentTimeMinutes,
} from '../utils/timeUtils';
import ActivityBlock from './ActivityBlock';

/* ---------- overlap layout algorithm ---------- */
function layoutDayBlocks(blocks) {
  if (!blocks.length) return new Map();
  const sorted = [...blocks].sort((a, b) => {
    if (a.startTime !== b.startTime) return a.startTime - b.startTime;
    return b.duration - a.duration;
  });
  const columns = [];
  for (const block of sorted) {
    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      const last = columns[col][columns[col].length - 1];
      if (last.startTime + last.duration <= block.startTime) {
        columns[col].push(block);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([block]);
  }
  const layout = new Map();
  for (let col = 0; col < columns.length; col++) {
    for (const block of columns[col]) {
      layout.set(block.id, { column: col, totalColumns: columns.length });
    }
  }
  return layout;
}

/* ---------- component ---------- */
export default function WeekGrid({
  currentWeekStart,
  activities,
  onMoveBlock,
  onResizeBlock,
  onOpenEditor,
  onOpenAddBlock,
  gridRef,
}) {
  const internalGridRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTimeMinutes);

  /* Update current time every 30 s */
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getCurrentTimeMinutes()), 30000);
    return () => clearInterval(timer);
  }, []);

  /* Group & layout */
  const activitiesByDay = useMemo(() => {
    const g = Array.from({ length: 7 }, () => []);
    activities.forEach((a) => {
      if (a.day >= 0 && a.day < 7) g[a.day].push(a);
    });
    return g;
  }, [activities]);

  const layoutsByDay = useMemo(
    () => activitiesByDay.map((b) => layoutDayBlocks(b)),
    [activitiesByDay],
  );

  /* Which day is today in the displayed week */
  const todayInWeek = useMemo(() => {
    const ws = currentWeekStart.getTime();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diff = Math.round((todayStart - ws) / 86400000);
    return diff >= 0 && diff < 7 ? diff : -1;
  }, [currentWeekStart]);

  /* ---------- drag / resize pointer handlers ---------- */
  const handleBlockPointerDown = useCallback(
    (e, block, mode) => {
      e.preventDefault();
      e.stopPropagation();

      const grid = internalGridRef.current;
      if (!grid) return;

      const gridRect = grid.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const origDay = block.day;
      const origStart = block.startTime;
      const origDuration = block.duration;
      const totalWidth = gridRect.width - TIME_LABEL_WIDTH;
      const colWidth = totalWidth / 7;

      setDragState({
        block,
        mode,
        startX,
        startY,
        origDay,
        origStart,
        origDuration,
        colWidth,
        currentDay: origDay,
        currentStart: origStart,
        currentDuration: origDuration,
      });

      const onMove = (me) => {
        const dx = me.clientX - startX;
        const dy = me.clientY - startY;

        if (mode === 'move') {
          const dayDelta = Math.round(dx / colWidth);
          const newDay = Math.max(0, Math.min(6, origDay + dayDelta));
          const timeDelta = snapToSlot(Math.round(dy / SLOT_HEIGHT) * 30);
          const newStart = Math.max(0, Math.min(1380, origStart + timeDelta));
          setDragState((prev) => prev && { ...prev, currentDay: newDay, currentStart: newStart });
        } else {
          const durDelta = snapToSlot(Math.round(dy / SLOT_HEIGHT) * 30);
          const newDur = Math.max(30, origDuration + durDelta);
          setDragState((prev) => prev && { ...prev, currentDuration: newDur });
        }
      };

      const onUp = (ue) => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);

        const dx = ue.clientX - startX;
        const dy = ue.clientY - startY;
        const totalDelta = Math.abs(dx) + Math.abs(dy);

        if (totalDelta < 4) {
          if (mode === 'move') onOpenEditor(block);
          setDragState(null);
          return;
        }

        if (mode === 'move') {
          const dayDelta = Math.round(dx / colWidth);
          const newDay = Math.max(0, Math.min(6, origDay + dayDelta));
          const timeDelta = snapToSlot(Math.round(dy / SLOT_HEIGHT) * 30);
          const newStart = Math.max(0, Math.min(1380, origStart + timeDelta));
          if (newDay !== origDay || newStart !== origStart) {
            onMoveBlock(block.id, newDay, newStart);
          }
        } else {
          const durDelta = snapToSlot(Math.round(dy / SLOT_HEIGHT) * 30);
          const newDur = Math.max(30, origDuration + durDelta);
          if (newDur !== origDuration) {
            onResizeBlock(block.id, newDur);
          }
        }
        setDragState(null);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [onMoveBlock, onResizeBlock, onOpenEditor],
  );

  /* Click on empty grid cell → add block */
  const handleGridClick = useCallback(
    (e) => {
      const cell = e.target.closest('.grid-cell');
      if (!cell) return;
      const day = Number(cell.dataset.day);
      const slot = Number(cell.dataset.slot);
      if (!Number.isNaN(day) && !Number.isNaN(slot)) {
        onOpenAddBlock(day, slot * 30);
      }
    },
    [onOpenAddBlock],
  );

  /* Ghost block during drag */
  const ghostBlock = useMemo(() => {
    if (!dragState) return null;
    const { block, mode, currentDay, currentStart, currentDuration } = dragState;
    return {
      ...block,
      day: mode === 'move' ? currentDay : block.day,
      startTime: mode === 'move' ? currentStart : block.startTime,
      duration: mode === 'resize' ? currentDuration : block.duration,
    };
  }, [dragState]);

  const totalGridHeight = 48 * SLOT_HEIGHT; // 24 h

  return (
    <div className="week-grid-container" ref={gridRef}>
      {/* ── Day headers (sticky top) ── */}
      <div className="day-headers">
        <div className="day-headers__spacer" />
        {DAYS_SHORT.map((day, i) => {
          const d = new Date(currentWeekStart);
          d.setDate(d.getDate() + i);
          return (
            <div
              key={day}
              className={`day-header${i === todayInWeek ? ' day-header--today' : ''}`}
            >
              <span className="day-header__name">{day}</span>
              <span className="day-header__date">{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      {/* ── Scrollable grid body ── */}
      <div
        className="week-grid"
        ref={internalGridRef}
        onClick={handleGridClick}
      >
        {/* Time labels (sticky left) */}
        <div className="time-labels">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="time-label"
              style={{ top: hour * 2 * SLOT_HEIGHT }}
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="day-columns" style={{ marginLeft: TIME_LABEL_WIDTH }}>
          {Array.from({ length: 7 }, (_, dayIdx) => {
            const dayBlocks = activitiesByDay[dayIdx];
            const layout = layoutsByDay[dayIdx];

            /* Filter out the block being dragged/resized */
            const filtered =
              dragState && dragState.block.day === dayIdx
                ? dayBlocks.filter((b) => b.id !== dragState.block.id)
                : dayBlocks;

            return (
              <div key={dayIdx} className="day-column" style={{ height: totalGridHeight }}>
                {/* Grid lines */}
                {Array.from({ length: 48 }, (_, slotIdx) => (
                  <div
                    key={slotIdx}
                    className={`grid-cell${slotIdx % 2 === 0 ? ' grid-cell--hour' : ' grid-cell--half'}`}
                    style={{ top: slotIdx * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                    data-day={dayIdx}
                    data-slot={slotIdx}
                  />
                ))}

                {/* Activity blocks */}
                {filtered.map((block) => {
                  const li = layout.get(block.id);
                  const col = li?.column ?? 0;
                  const total = li?.totalColumns ?? 1;
                  const w = `calc(${100 / total}% - 3px)`;
                  const l = `calc(${col * (100 / total)}% + 1px)`;

                  return (
                    <ActivityBlock
                      key={block.id}
                      block={block}
                      style={{
                        top: (block.startTime / 30) * SLOT_HEIGHT,
                        height: (block.duration / 30) * SLOT_HEIGHT,
                        width: w,
                        left: l,
                      }}
                      onPointerDown={handleBlockPointerDown}
                      onRequestEdit={onOpenEditor}
                    />
                  );
                })}

                {/* Ghost */}
                {ghostBlock && ghostBlock.day === dayIdx && (
                  <ActivityBlock
                    block={ghostBlock}
                    style={{
                      top: (ghostBlock.startTime / 30) * SLOT_HEIGHT,
                      height: (ghostBlock.duration / 30) * SLOT_HEIGHT,
                      width: 'calc(100% - 3px)',
                      left: '1px',
                    }}
                    isGhost
                    onPointerDown={() => {}}
                    onRequestEdit={() => {}}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Current time line ── */}
        {todayInWeek >= 0 && currentTime >= 0 && currentTime < 1440 && (
          <div
            className="current-time-line"
            style={{
              top: (currentTime / 30) * SLOT_HEIGHT,
              left: TIME_LABEL_WIDTH,
            }}
          >
            <div className="current-time-line__dot" />
            <div className="current-time-line__line" />
          </div>
        )}
      </div>
    </div>
  );
}
