import { memo } from 'react';
import { minutesToTime, formatDuration } from '../utils/timeUtils';

const ActivityBlock = memo(function ActivityBlock({
  block,
  style,
  onPointerDown,
  onRequestEdit,
  isGhost = false,
}) {
  const startStr = minutesToTime(block.startTime);
  const endStr = minutesToTime(block.startTime + block.duration);

  const blockStyle = {
    ...style,
    backgroundColor: `${block.color}15`,
    borderLeft: `3px solid ${block.color}`,
    borderLeftColor: isGhost ? `${block.color}80` : block.color,
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onRequestEdit) onRequestEdit(block);
    }
  };

  const showContent = (block.duration / 30) * 28 >= 36;

  return (
    <div
      className={`activity-block${isGhost ? ' activity-block--ghost' : ''}`}
      style={blockStyle}
      onPointerDown={(e) => {
        if (!isGhost) onPointerDown(e, 'move');
      }}
      tabIndex={isGhost ? -1 : 0}
      role="button"
      aria-label={`${block.title}, ${startStr} – ${endStr}`}
      onKeyDown={handleKeyDown}
    >
      <div className="activity-block__content">
        {showContent && (
          <span className="activity-block__title">{block.title}</span>
        )}
        {showContent && (
          <span className="activity-block__time">
            {startStr} – {endStr}
          </span>
        )}
        {!showContent && (
          <span className="activity-block__title" style={{ fontSize: '0.65rem' }}>
            {block.title}
          </span>
        )}
        {block.notes && showContent && (
          <span className="activity-block__notes-indicator" title={block.notes}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3 1h4l4 4v6H3V1z" />
              <path d="M7 1v4h4" />
            </svg>
          </span>
        )}
        {block.notes && !showContent && (
          <span
            className="activity-block__notes-indicator"
            title={block.notes}
            style={{ top: 2, right: 2 }}
          >
            <svg width="8" height="8" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3 1h4l4 4v6H3V1z" />
              <path d="M7 1v4h4" />
            </svg>
          </span>
        )}
      </div>

      {!isGhost && (
        <div
          className="activity-block__resize-handle"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onPointerDown(e, 'resize');
          }}
          aria-label="Ridimensiona attività"
          tabIndex={-1}
        >
          <svg width="14" height="6" viewBox="0 0 14 6" fill="currentColor" opacity="0.35">
            <rect x="3" y="1" width="8" height="1" rx="0.5" />
            <rect x="3" y="4" width="8" height="1" rx="0.5" />
          </svg>
        </div>
      )}
    </div>
  );
});

export default ActivityBlock;
