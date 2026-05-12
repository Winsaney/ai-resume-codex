"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  HistoryRecord,
  getAllRecords,
  getRecord,
  addRecord as dbAddRecord,
  deleteRecord as dbDeleteRecord,
  updateRecord as dbUpdateRecord,
  deleteAllRecords as dbDeleteAllRecords,
  importRecords as dbImportRecords,
} from './db';

interface HistoryContextType {
  records: HistoryRecord[];
  totalCount: number;
  addRecord: (record: HistoryRecord) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  deleteAllRecords: () => Promise<void>;
  updateLabel: (id: string, label: string) => Promise<void>;
  restoreRecord: HistoryRecord | null;
  setRestoreRecord: (record: HistoryRecord | null) => void;
  clearRestoreRecord: () => void;
  refreshRecords: () => Promise<void>;
  importRecords: (records: HistoryRecord[], mode: 'merge' | 'replace') => Promise<void>;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [restoreRecord, setRestoreRecord] = useState<HistoryRecord | null>(null);

  const refreshRecords = useCallback(async () => {
    const all = await getAllRecords();
    setRecords(all);
  }, []);

  useEffect(() => {
    refreshRecords();
  }, [refreshRecords]);

  const addRecordFn = useCallback(async (record: HistoryRecord) => {
    await dbAddRecord(record);
    await refreshRecords();
  }, [refreshRecords]);

  const deleteRecordFn = useCallback(async (id: string) => {
    await dbDeleteRecord(id);
    await refreshRecords();
  }, [refreshRecords]);

  const deleteAllFn = useCallback(async () => {
    await dbDeleteAllRecords();
    await refreshRecords();
  }, [refreshRecords]);

  const updateLabelFn = useCallback(async (id: string, label: string) => {
    const existing = await getRecord(id);
    if (existing) {
      await dbUpdateRecord({ ...existing, label });
      await refreshRecords();
    }
  }, [refreshRecords]);

  const importRecordsFn = useCallback(async (imported: HistoryRecord[], mode: 'merge' | 'replace') => {
    await dbImportRecords(imported, mode);
    await refreshRecords();
  }, [refreshRecords]);

  const clearRestoreRecord = useCallback(() => setRestoreRecord(null), []);

  return (
    <HistoryContext.Provider
      value={{
        records,
        totalCount: records.length,
        addRecord: addRecordFn,
        deleteRecord: deleteRecordFn,
        deleteAllRecords: deleteAllFn,
        updateLabel: updateLabelFn,
        restoreRecord,
        setRestoreRecord,
        clearRestoreRecord,
        refreshRecords,
        importRecords: importRecordsFn,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
