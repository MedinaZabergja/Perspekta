export interface ThoughtEntry {
  id: string;
  thought: string;
  evidence: string[];
  balancedPerspective: string;
  createdAt: number;
  completedAt: number;
}

export interface FearEntry {
  id: string;
  fear: string;
  counterArgument: string;
  createdAt: number;
}

export interface ActivityCompletion {
  id: string;
  activityId: string;
  activityTitle: string;
  completedAt: number;
  note?: string;
}

export interface AppState {
  hasCompletedOnboarding: boolean;
  currentScreen:
    | 'onboarding'
    | 'home'
    | 'thought-input'
    | 'evidence'
    | 'perspective'
    | 'completion'
    | 'reflection-mode'
    | 'history'
    | 'fear-jar';
  currentEntry: Partial<ThoughtEntry> | null;
  reflectionModeUntil: number | null;
  reflectionModeDismissed: boolean;
  completedThoughts: ThoughtEntry[];
  fearJar: FearEntry[];
  completedActivities: ActivityCompletion[];
}

export interface OfflineActivity {
  id: string;
  title: string;
  description: string;
  icon: string;
}
