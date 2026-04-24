import { useNavigate } from 'react-router';
import { useAppState } from '../hooks/useAppState';
import { getVisibleThoughts } from '../storage';
import ThoughtHistory from '../components/ThoughtHistory';

export default function HistoryPage() {
  const { state } = useAppState();
  const navigate = useNavigate();

  const visibleThoughts = getVisibleThoughts(state.completedThoughts);
  const hiddenThoughtCount = Math.max(0, state.completedThoughts.length - visibleThoughts.length);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <ThoughtHistory
      thoughts={visibleThoughts}
      hiddenThoughtCount={hiddenThoughtCount}
      onBack={handleBack}
    />
  );
}
