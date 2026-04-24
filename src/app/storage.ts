import { AppState, ThoughtEntry } from './types';
import { api } from './api';
import { getCurrentUserId } from './identity';

const STORAGE_KEY_PREFIX = 'perspekta_data';
const REFLECTION_DURATION = 4 * 60 * 60 * 1000; // 4 hours
const getStorageKey = () => `${STORAGE_KEY_PREFIX}:${getCurrentUserId()}`;

// localStorage fallback functions
const getLocalState = (): AppState => {
  const defaultState: AppState = {
    hasCompletedOnboarding: false,
    currentScreen: 'onboarding',
    currentEntry: null,
    reflectionModeUntil: null,
    reflectionModeDismissed: false,
    completedThoughts: [],
    fearJar: [],
    completedActivities: [],
  };

  try {
    const storageKey = getStorageKey();
    const stored =
      localStorage.getItem(storageKey) || localStorage.getItem(STORAGE_KEY_PREFIX);

    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default state to ensure all fields exist
      const normalizedState = {
        ...defaultState,
        ...parsed,
        reflectionModeDismissed: parsed.reflectionModeDismissed ?? false,
        fearJar: parsed.fearJar || [],
        completedActivities: parsed.completedActivities || [],
      };

      localStorage.setItem(storageKey, JSON.stringify(normalizedState));
      return normalizedState;
    }
  } catch (error) {
    console.error('Error loading local state:', error);
  }

  return defaultState;
};

const saveLocalState = (state: AppState): void => {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
  } catch (error) {
    console.error('Error saving local state:', error);
  }
};

// Main API functions with localStorage fallback
export const getAppState = async (): Promise<AppState> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return getLocalState();
  }

  try {
    // Try to get state from API
    const state = await api.getState();
    // Ensure all fields exist (for backward compatibility)
    const normalizedState: AppState = {
      ...state,
      reflectionModeDismissed: state.reflectionModeDismissed ?? false,
      fearJar: state.fearJar || [],
      completedActivities: state.completedActivities || [],
    };
    // Cache in localStorage
    saveLocalState(normalizedState);
    return normalizedState;
  } catch (error) {
    console.error('Error loading app state from API, using local cache:', error);
    // Fallback to localStorage
    return getLocalState();
  }
};

export const saveAppState = async (state: AppState): Promise<void> => {
  // Save to localStorage immediately (optimistic update)
  saveLocalState(state);

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  // Try to sync with API
  try {
    await api.saveState(state);
  } catch (error) {
    console.error('Error saving app state to API, stored locally only:', error);
    // State is still saved locally, so user won't lose data
  }
};

export const startReflectionMode = (): number => {
  return Date.now() + REFLECTION_DURATION;
};

export const isInReflectionMode = (reflectionModeUntil: number | null): boolean => {
  if (!reflectionModeUntil) return false;
  return Date.now() < reflectionModeUntil;
};

export const getTimeRemaining = (reflectionModeUntil: number): string => {
  const remaining = reflectionModeUntil - Date.now();
  if (remaining <= 0) return '0 minutes';

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};

export const getVisibleThoughts = (thoughts: ThoughtEntry[]): ThoughtEntry[] => {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  return thoughts.filter(thought => thought.completedAt <= thirtyDaysAgo);
};
