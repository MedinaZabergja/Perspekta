import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { AppState } from '../types';
import { getAppState, saveAppState } from '../storage';
import { auth } from '../auth';
import Onboarding from '../components/Onboarding';
import ConnectionStatus from '../components/ConnectionStatus';
import AuthModal from '../components/AuthModal';
import SaveProgressBanner from '../components/SaveProgressBanner';
import AccountChip from '../components/AccountChip';
import { AppStateContext } from '../contexts/AppStateContext';

const DEFAULT_APP_STATE: AppState = {
  hasCompletedOnboarding: false,
  currentScreen: 'onboarding',
  currentEntry: null,
  reflectionModeUntil: null,
  reflectionModeDismissed: false,
  completedThoughts: [],
  fearJar: [],
  completedActivities: [],
};

const loadActiveAppState = async (): Promise<AppState> => {
  try {
    return await getAppState();
  } catch (error) {
    console.error('Error loading app state:', error);
    return DEFAULT_APP_STATE;
  }
};

export default function RootLayout() {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(auth.getCachedUser()));
  const [currentUser, setCurrentUser] = useState(auth.getCachedUser());
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const syncSessionAndState = async (userOverride?: typeof currentUser) => {
      setIsLoading(true);
      const activeUser = userOverride ?? await auth.getCurrentUser();
      const loadedState = await loadActiveAppState();

      if (!isMounted) {
        return;
      }

      setState(loadedState);
      setCurrentUser(activeUser);
      setIsAuthenticated(Boolean(activeUser));
      setIsLoading(false);
    };

    void syncSessionAndState();

    const unsubscribe = auth.onAuthStateChange((user) => {
      if (!isMounted) {
        return;
      }

      void syncSessionAndState(user);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (state && !isLoading) {
      saveAppState(state);
    }
  }, [state, isLoading]);

  const handleCompleteOnboarding = () => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        hasCompletedOnboarding: true,
        currentScreen: 'home',
      };
    });
    navigate('/');
  };

  const handleSignIn = async (email: string, password: string) => {
    await auth.signIn(email, password);
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    await auth.signUp(email, password, name);
  };

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/');
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  // Show loading state
  if (isLoading || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse">
              <circle cx="50" cy="55" r="35" fill="#AED7D3" />
              <circle cx="30" cy="55" r="6" fill="#F1C6D9" opacity="0.7" />
              <circle cx="70" cy="55" r="6" fill="#F1C6D9" opacity="0.7" />
              <circle cx="40" cy="45" r="3" fill="#3d3244" />
              <circle cx="60" cy="45" r="3" fill="#3d3244" />
              <line x1="42" y1="62" x2="58" y2="62" stroke="#3d3244" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[#B5A4AC]">Loading Perspekta...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if not completed
  if (!state.hasCompletedOnboarding) {
    return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  return (
    <AppStateContext.Provider value={{ state, setState }}>
      {!isAuthenticated && (
        <SaveProgressBanner onSignIn={openAuthModal} />
      )}
      {isAuthenticated && currentUser && (
        <AccountChip
          email={currentUser.email}
          name={currentUser.name}
          onSignOut={handleSignOut}
        />
      )}
      <ConnectionStatus />
      <main className={isAuthenticated ? 'min-h-dvh' : 'min-h-[calc(100dvh-var(--save-banner-height))]'}>
        <Outlet />
      </main>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
      />
    </AppStateContext.Provider>
  );
}
