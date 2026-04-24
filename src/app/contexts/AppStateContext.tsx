import { createContext } from 'react';
import { AppState } from '../types';

interface AppStateContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState | null>>;
}

export const AppStateContext = createContext<AppStateContextType | null>(null);
