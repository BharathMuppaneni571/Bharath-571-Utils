import { useEffect, useCallback } from 'react';
import { useHistoryStore } from './useHistoryStore';

export function useToolState<T>(
  toolId: string,
  setValues: (values: T) => void,
  getValues: () => T
) {
  const { saveHistory } = useHistoryStore();

  const restoreState = useCallback((payload: any) => {
    if (payload) {
      setValues(payload);
    }
  }, [setValues]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail.toolId === toolId) {
        restoreState(e.detail.payload);
      }
    };
    window.addEventListener('nexus-restore-tool-state', handler);
    return () => window.removeEventListener('nexus-restore-tool-state', handler);
  }, [toolId, restoreState]);

  const recordAction = useCallback((_message?: string) => {
    const currentValues = getValues();
    saveHistory(toolId, currentValues);
  }, [toolId, getValues, saveHistory]);

  return { recordAction };
}
