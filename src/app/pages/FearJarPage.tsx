import { useNavigate } from 'react-router';
import { useAppState } from '../hooks/useAppState';
import { FearEntry } from '../types';
import FearJar from '../components/FearJar';

export default function FearJarPage() {
  const { state, setState } = useAppState();
  const navigate = useNavigate();

  const handleAddFear = (fear: string) => {   // ← removed second param
    const newFear: FearEntry = {
      id: Date.now().toString(),
      fear,
      createdAt: Date.now(),
      // counterArgument removed
    };

   setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fearJar: [...prev.fearJar, newFear],
      };
    });
  };
  const handleRemoveFear = (id: string) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fearJar: prev.fearJar.filter((fear) => fear.id !== id),
      };
    });
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <FearJar
      fears={state.fearJar}
      onAddFear={handleAddFear}
      onRemoveFear={handleRemoveFear}
      onBack={handleBack}
    />
  );
}
