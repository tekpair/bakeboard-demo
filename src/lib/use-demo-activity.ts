'use client';
import { useEffect, useState } from 'react';
import type { Activity } from './types';
import { activityChangeEventName, readStoredActivities } from './task-storage';

export function useDemoActivity(initialActivities: Activity[]) {
  const [activities, setActivities] = useState<Activity[]>([]);
  useEffect(() => {
    const refresh = () =>
      setActivities(readStoredActivities(initialActivities));
    refresh();
    window.addEventListener(activityChangeEventName(), refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(activityChangeEventName(), refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [initialActivities]);
  return activities;
}
