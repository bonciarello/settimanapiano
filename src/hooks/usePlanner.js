import { useState, useCallback, useEffect, useRef } from 'react';
import { saveWeek, loadWeek } from '../utils/storage';
import { getWeekStart, addWeeks, formatWeekRange } from '../utils/weekUtils';
import { DEFAULT_COLOR } from '../constants';

let nextId = Date.now();

function generateId() {
  return `b_${(nextId++).toString(36)}`;
}

export function usePlanner() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(new Date())
  );
  const [activities, setActivities] = useState([]);
  const [editingBlock, setEditingBlock] = useState(null);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const prevWeekRef = useRef(currentWeekStart);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const loaded = loadWeek(currentWeekStart);
    setActivities(loaded);
    prevWeekRef.current = currentWeekStart;
    isInitialLoad.current = false;
  }, [currentWeekStart]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    if (prevWeekRef.current.getTime() === currentWeekStart.getTime()) {
      saveWeek(currentWeekStart, activities);
    }
  }, [activities, currentWeekStart]);

  const addBlock = useCallback((blockData) => {
    const newBlock = {
      id: generateId(),
      title: (blockData.title || 'Nuova attività').trim(),
      day: blockData.day ?? 0,
      startTime: blockData.startTime ?? 480,
      duration: Math.min(blockData.duration ?? 60, 1440 - (blockData.startTime ?? 480)),
      color: blockData.color || DEFAULT_COLOR,
      notes: (blockData.notes || '').trim(),
    };
    setActivities((prev) => [...prev, newBlock]);
    return newBlock;
  }, []);

  const updateBlock = useCallback((id, updates) => {
    setActivities((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  const deleteBlock = useCallback((id) => {
    setActivities((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const moveBlock = useCallback((id, newDay, newStartTime) => {
    setActivities((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          day: Math.max(0, Math.min(6, newDay)),
          startTime: Math.max(0, Math.min(1380, newStartTime)),
        };
      })
    );
  }, []);

  const resizeBlock = useCallback((id, newDuration) => {
    setActivities((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const maxDuration = 1440 - b.startTime;
        return { ...b, duration: Math.max(30, Math.min(maxDuration, newDuration)) };
      })
    );
  }, []);

  const navigateWeek = useCallback((direction) => {
    setCurrentWeekStart((prev) => addWeeks(prev, direction));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    const currentWeek = getWeekStart(new Date());
    setCurrentWeekStart((prev) => {
      if (prev.getTime() === currentWeek.getTime()) return prev;
      return currentWeek;
    });
  }, []);

  const openEditor = useCallback((block) => {
    setEditingBlock(block);
    setIsAddingBlock(false);
    setInitialData(null);
  }, []);

  const openAddBlock = useCallback((day, startTime) => {
    setInitialData({ day, startTime });
    setIsAddingBlock(true);
    setEditingBlock(null);
  }, []);

  const closeEditor = useCallback(() => {
    setEditingBlock(null);
    setIsAddingBlock(false);
    setInitialData(null);
  }, []);

  const weekRange = formatWeekRange(currentWeekStart);

  return {
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
  };
}
