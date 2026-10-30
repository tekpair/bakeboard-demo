'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  readStoredTasks,
  resetStoredTasks,
  taskChangeEventName,
  writeStoredTasks,
} from './task-storage';
import type { ProductionTask } from './types';

export function useDemoTasks(initialTasks: ProductionTask[]) {
  const [tasks, setTasks] = useState(initialTasks);
  useEffect(() => {
    const refresh = () => setTasks(readStoredTasks());
    refresh();
    const eventName = taskChangeEventName();
    window.addEventListener(eventName, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(eventName, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  const commit = useCallback((next: ProductionTask[]) => {
    setTasks(writeStoredTasks(next));
  }, []);
  const reset = useCallback(() => {
    const defaults = resetStoredTasks();
    setTasks(defaults);
  }, []);
  return { tasks, commit, reset };
}
