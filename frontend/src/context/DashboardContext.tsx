/**
 * Dashboard Context
 * @description Global state management for dashboard
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { HallStatistics, TableWithOccupancy, OverallStatistics } from '../types';

// State Types
interface DashboardState {
  readonly selectedHallId: string | null;
  readonly halls: HallStatistics[];
  readonly tables: TableWithOccupancy[];
  readonly statistics: OverallStatistics | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly lastUpdated: Date | null;
}

// Action Types
type DashboardAction =
  | { type: 'SELECT_HALL'; payload: string }
  | { type: 'SET_HALLS'; payload: HallStatistics[] }
  | { type: 'SET_TABLES'; payload: TableWithOccupancy[] }
  | { type: 'SET_STATISTICS'; payload: OverallStatistics }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'REFRESH' };

// Initial State
const initialState: DashboardState = {
  selectedHallId: null,
  halls: [],
  tables: [],
  statistics: null,
  isLoading: true,
  error: null,
  lastUpdated: null,
};

// Reducer
const dashboardReducer = (
  state: DashboardState,
  action: DashboardAction
): DashboardState => {
  switch (action.type) {
    case 'SELECT_HALL':
      return {
        ...state,
        selectedHallId: action.payload,
        tables: [], // Clear tables when switching halls
      };
    case 'SET_HALLS':
      return {
        ...state,
        halls: action.payload,
        selectedHallId: state.selectedHallId ?? action.payload[0]?.id ?? null,
        lastUpdated: new Date(),
      };
    case 'SET_TABLES':
      return {
        ...state,
        tables: action.payload,
        lastUpdated: new Date(),
      };
    case 'SET_STATISTICS':
      return {
        ...state,
        statistics: action.payload,
        lastUpdated: new Date(),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'REFRESH':
      return { ...state, lastUpdated: new Date() };
    default:
      return state;
  }
};

// Context Types
interface DashboardContextValue {
  state: DashboardState;
  dispatch: Dispatch<DashboardAction>;
  actions: {
    selectHall: (id: string) => void;
    setHalls: (halls: HallStatistics[]) => void;
    setTables: (tables: TableWithOccupancy[]) => void;
    setStatistics: (stats: OverallStatistics) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
  };
  selectedHall: HallStatistics | undefined;
}

// Context
const DashboardContext = createContext<DashboardContextValue | null>(null);

// Provider
interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const actions = useMemo(
    () => ({
      selectHall: (id: string) => dispatch({ type: 'SELECT_HALL', payload: id }),
      setHalls: (halls: HallStatistics[]) =>
        dispatch({ type: 'SET_HALLS', payload: halls }),
      setTables: (tables: TableWithOccupancy[]) =>
        dispatch({ type: 'SET_TABLES', payload: tables }),
      setStatistics: (stats: OverallStatistics) =>
        dispatch({ type: 'SET_STATISTICS', payload: stats }),
      setLoading: (loading: boolean) =>
        dispatch({ type: 'SET_LOADING', payload: loading }),
      setError: (error: string | null) =>
        dispatch({ type: 'SET_ERROR', payload: error }),
    }),
    []
  );

  const selectedHall = useMemo(
    () => state.halls.find((h) => h.id === state.selectedHallId),
    [state.halls, state.selectedHallId]
  );

  const value = useMemo(
    () => ({ state, dispatch, actions, selectedHall }),
    [state, actions, selectedHall]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook
export const useDashboard = (): DashboardContextValue => {
  const context = useContext(DashboardContext);
  
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  
  return context;
};

