import { useNavigate } from 'react-router';
import { useAppState } from '../hooks/useAppState';
import { getTimeRemaining, isInReflectionMode } from '../storage';
import Home from '../components/Home';
import ReflectionMode from '../components/ReflectionMode';
import AuthModal from '../components/AuthModal';
import { auth } from '../auth';
import type { StoredUser } from '../identity';
import { ActivityCompletion } from '../types';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { state, setState } = useAppState();
  const navigate = useNavigate();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(auth.getCachedUser());

  const isReflectionLocked =
    state.reflectionModeUntil !== null && isInReflectionMode(state.reflectionModeUntil);

  const [countdown, setCountdown] = useState(
    state.reflectionModeUntil ? getTimeRemaining(state.reflectionModeUntil) : null
  );

  useEffect(() => {
    auth.getCurrentUser().then(setUser);

    const unsubscribe = auth.onAuthStateChange((currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (state.reflectionModeUntil && !isInReflectionMode(state.reflectionModeUntil)) {
      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reflectionModeUntil: null,
          reflectionModeDismissed: false,
        };
      });
    }
  }, [state.reflectionModeUntil, setState]);

  useEffect(() => {
    if (!state.reflectionModeUntil || !isInReflectionMode(state.reflectionModeUntil)) {
      setCountdown(null);
      return;
    }

    setCountdown(getTimeRemaining(state.reflectionModeUntil));

    const interval = setInterval(() => {
      setCountdown(getTimeRemaining(state.reflectionModeUntil!));
    }, 60000);

    return () => clearInterval(interval);
  }, [state.reflectionModeUntil]);

  const handleStartReflection = () => {
    if (isReflectionLocked) return;

    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentEntry: {
          id: Date.now().toString(),
          createdAt: Date.now(),
        },
      };
    });

    navigate('/reflect');
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  const handleOpenFearJar = () => {
    navigate('/fear-jar');
  };

  const handleCompleteActivity = (activityId: string, activityTitle: string, note?: string) => {
    const completion: ActivityCompletion = {
      id: Date.now().toString(),
      activityId,
      activityTitle,
      completedAt: Date.now(),
      note,
    };

    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        completedActivities: [...prev.completedActivities, completion],
      };
    });
  };

  const handleFinishReflectionEarly = () => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        reflectionModeDismissed: true,
      };
    });

    navigate('/');
  };

  const handleReturnToReflectionMode = () => {
    if (!isReflectionLocked) return;

    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        reflectionModeDismissed: false,
      };
    });
  };

  if (isReflectionLocked && !state.reflectionModeDismissed) {
    return (
      <>
        <ReflectionMode
          reflectionModeUntil={state.reflectionModeUntil!}
          onViewHistory={handleViewHistory}
          onFinishEarly={handleFinishReflectionEarly}
          onCompleteActivity={handleCompleteActivity}
          completedActivities={state.completedActivities || []}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSignIn={async (email, password) => {
            await auth.signIn(email, password);
          }}
          onSignUp={async (email, password, name) => {
            await auth.signUp(email, password, name);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Home
        user={user}
        onStartReflection={handleStartReflection}
        onViewHistory={handleViewHistory}
        onOpenFearJar={handleOpenFearJar}
        isReflectionLocked={isReflectionLocked}
        reflectionCountdown={countdown}
        canReturnToReflectionMode={isReflectionLocked && state.reflectionModeDismissed}
        onReturnToReflectionMode={handleReturnToReflectionMode}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSignIn={async (email, password) => {
          await auth.signIn(email, password);
        }}
        onSignUp={async (email, password, name) => {
          await auth.signUp(email, password, name);
        }}
      />
    </>
  );
}