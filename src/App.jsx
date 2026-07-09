import { useRef, useCallback } from 'react';
import { usePlanner } from './hooks/usePlanner';
import Header from './components/Header';
import WeekGrid from './components/WeekGrid';
import BlockEditor from './components/BlockEditor';
import ExportMenu from './components/ExportMenu';

export default function App() {
  const gridRef = useRef(null);

  const {
    currentWeekStart,
    weekRange,
    activities,
    editingBlock,
    isAddingBlock,
    initialData,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    resizeBlock,
    navigateWeek,
    goToCurrentWeek,
    openEditor,
    openAddBlock,
    closeEditor,
  } = usePlanner();

  const isCurrentWeek = (() => {
    const now = new Date();
    const ws = new Date(currentWeekStart);
    const we = new Date(ws);
    we.setDate(we.getDate() + 6);
    we.setHours(23, 59, 59, 999);
    return now >= ws && now <= we;
  })();

  const handleSaveBlock = useCallback(
    (data) => {
      if (isAddingBlock) {
        addBlock(data);
      } else if (data.id) {
        updateBlock(data.id, {
          title: data.title,
          day: data.day,
          startTime: data.startTime,
          duration: data.duration,
          color: data.color,
          notes: data.notes,
        });
      }
      closeEditor();
    },
    [isAddingBlock, addBlock, updateBlock, closeEditor],
  );

  const handleDeleteBlock = useCallback(
    (id) => {
      deleteBlock(id);
      closeEditor();
    },
    [deleteBlock, closeEditor],
  );

  const handleAddBlock = useCallback(() => {
    openAddBlock(0, 480); // Lunedì 08:00
  }, [openAddBlock]);

  return (
    <div className="app">
      <Header
        weekRange={weekRange}
        onPrevWeek={() => navigateWeek(-1)}
        onNextWeek={() => navigateWeek(1)}
        onCurrentWeek={goToCurrentWeek}
        onAddBlock={handleAddBlock}
        isCurrentWeek={isCurrentWeek}
      />

      <main className="app-main">
        <div className="app-toolbar">
          <ExportMenu
            activities={activities}
            weekRange={weekRange}
            gridRef={gridRef}
          />
          <span className="app-toolbar__count">
            {activities.length} {activities.length === 1 ? 'attività' : 'attività'}
          </span>
        </div>

        <WeekGrid
          currentWeekStart={currentWeekStart}
          activities={activities}
          onMoveBlock={moveBlock}
          onResizeBlock={resizeBlock}
          onOpenEditor={openEditor}
          onOpenAddBlock={openAddBlock}
          gridRef={gridRef}
        />
      </main>

      {(editingBlock || isAddingBlock) && (
        <BlockEditor
          block={editingBlock}
          isNew={isAddingBlock}
          initialData={initialData}
          onSave={handleSaveBlock}
          onDelete={handleDeleteBlock}
          onClose={closeEditor}
        />
      )}

      <footer className="app-footer">
        <p>
          SettimanaPiano — I tuoi dati sono salvati in locale sul browser.
          Clicca sulla griglia per aggiungere un&rsquo;attività, trascina i
          blocchi per spostarli, usa il bordo inferiore per ridimensionarli.
        </p>
      </footer>
    </div>
  );
}
