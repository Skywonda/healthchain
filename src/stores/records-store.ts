// src/stores/records-store.ts
import { create } from 'zustand';
import type { MedicalRecord, RecordType } from '@/types/medical-records';

interface RecordsState {
  records: MedicalRecord[];
  selectedRecord: MedicalRecord | null;
  isLoading: boolean;
  filters: {
    recordType?: RecordType;
    dateRange?: { from: Date; to: Date };
    searchTerm?: string;
  };
  
  // Actions
  setRecords: (records: MedicalRecord[]) => void;
  addRecord: (record: MedicalRecord) => void;
  updateRecord: (id: string, updates: Partial<MedicalRecord>) => void;
  deleteRecord: (id: string) => void;
  setSelectedRecord: (record: MedicalRecord | null) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<RecordsState['filters']>) => void;
  clearFilters: () => void;
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
  records: [],
  selectedRecord: null,
  isLoading: false,
  filters: {},
  
  setRecords: (records) => set({ records }),
  
  addRecord: (record) => set((state) => ({ 
    records: [record, ...state.records] 
  })),
  
  updateRecord: (id, updates) => set((state) => ({
    records: state.records.map(record => 
      record.id === id ? { ...record, ...updates } : record
    )
  })),
  
  deleteRecord: (id) => set((state) => ({
    records: state.records.filter(record => record.id !== id),
    selectedRecord: state.selectedRecord?.id === id ? null : state.selectedRecord
  })),
  
  setSelectedRecord: (selectedRecord) => set({ selectedRecord }),
  setLoading: (isLoading) => set({ isLoading }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  clearFilters: () => set({ filters: {} }),
}));