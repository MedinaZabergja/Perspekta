import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import AppleMascot from './AppleMascot';
import { Sparkles, Coffee, Pencil, Footprints, Heart, RefreshCw, Dumbbell, Wind, Waves, Smile, Music, Check } from 'lucide-react';
import { getTimeRemaining } from '../storage';
import { ActivityCompletion } from '../types';
import ReflectionMiniGames from './ReflectionMiniGames';

interface ReflectionModeProps {
  reflectionModeUntil: number;
  onViewHistory: () => void;
  onFinishEarly: () => void;
  onCompleteActivity: (activityId: string, activityTitle: string, note?: string) => void;
  completedActivities: ActivityCompletion[];
}

const activities = [
  {
    id: 'draw',
    title: 'Draw Something Playful',
    description: 'Sketch a silly cat, doodle patterns, or draw how you feel right now',
    icon: Pencil,
  },
  {
    id: 'write',
    title: 'Three Good Things',
    description: 'Write down three positive observations about your day, no matter how small',
    icon: Heart,
  },
  {
    id: 'walk',
    title: 'Take a Mindful Walk',
    description: 'Step outside for 5-10 minutes. Notice the sounds, colors, and sensations',
    icon: Footprints,
  },
  {
    id: 'craft',
    title: 'Simple Craft',
    description: 'Fold paper stars, make origami, or create something with your hands',
    icon: Sparkles,
  },
  {
    id: 'drink',
    title: 'Mindful Tea/Coffee',
    description: 'Prepare a warm drink slowly. Focus on the aroma, warmth, and taste',
    icon: Coffee,
  },
  {
    id: 'stretch',
    title: 'Gentle Stretching',
    description: 'Do 5 minutes of gentle stretches. Reach for the sky, touch your toes, roll your shoulders',
    icon: Dumbbell,
  },
  {
    id: 'breathing',
    title: 'Box Breathing',
    description: 'Breathe in for 4 counts, hold for 4, out for 4, hold for 4. Repeat 5 times',
    icon: Wind,
  },
  {
    id: 'movement',
    title: 'Dance to One Song',
    description: 'Put on your favorite upbeat song and move your body however feels good',
    icon: Music,
  },
  {
    id: 'cold-water',
    title: 'Cold Water Reset',
    description: 'Splash cold water on your face or hold an ice cube to ground yourself',
    icon: Waves,
  },
  {
    id: 'smile',
    title: 'Smile Exercise',
    description: 'Hold a genuine smile for 30 seconds. Even forced smiling can shift your mood',
    icon: Smile,
  },
];

export default function ReflectionMode({
  reflectionModeUntil,
  onViewHistory,
  onFinishEarly,
  onCompleteActivity,
  completedActivities,
}: ReflectionModeProps) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(reflectionModeUntil));
  const [selectedActivity, setSelectedActivity] = useState(
    activities[Math.floor(Math.random() * activities.length)]
  );
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completionNote, setCompletionNote] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(reflectionModeUntil));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [reflectionModeUntil]);

  const shuffleActivity = () => {
    const otherActivities = activities.filter((a) => a.id !== selectedActivity.id);
    setSelectedActivity(otherActivities[Math.floor(Math.random() * otherActivities.length)]);
    setShowCompletionForm(false);
    setCompletionNote('');
  };

  const handleMarkComplete = () => {
    onCompleteActivity(selectedActivity.id, selectedActivity.title, completionNote.trim() || undefined);
    setShowCompletionForm(false);
    setCompletionNote('');
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 sm:py-10">
      <motion.div
        className="mx-auto flex min-h-full w-full max-w-4xl items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center gap-8">
          <AppleMascot emotion="happy" size="md" />

          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-3xl text-[#3d3244]">Reflection Mode</h1>
            <p className="text-[#B5A4AC]">Time to step away and engage with the world</p>
          </motion.div>

          <motion.div
            className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 space-y-6 border border-[#F1C6D9]/20 shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-[#AED7D3]/40 to-[#C3D162]/30 rounded-2xl p-6 text-center space-y-3">
              <div className="text-3xl">🌸</div>
              <p className="text-[#3d3244]">
                You've completed your reflection for today. To prevent rumination loops, new
                reflections will be available in:
              </p>
              <p className="text-2xl font-medium text-[#F1C6D9]">{timeRemaining}</p>
            </div>

            <div className="space-y-4">
              <ReflectionMiniGames />

              <div className="flex items-center justify-between">
                <h2 className="text-xl text-[#3d3244]">Suggested Activity</h2>
                <motion.button
                  onClick={shuffleActivity}
                  aria-label="Show another activity"
                  className="p-2 text-[#B5A4AC] hover:text-[#F1C6D9] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <RefreshCw className="w-5 h-5" />
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedActivity.id}
                  className="bg-[#ffffff] rounded-2xl p-6 space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#F1C6D9]/20 flex items-center justify-center flex-shrink-0">
                      <selectedActivity.icon className="w-6 h-6 text-[#F1C6D9]" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-medium text-[#3d3244]">{selectedActivity.title}</h3>
                      <p className="text-sm text-[#B5A4AC]">{selectedActivity.description}</p>
                    </div>
                  </div>

                  {!showCompletionForm ? (
                    <motion.button
                      onClick={() => setShowCompletionForm(true)}
                      className="w-full px-6 py-3 bg-[#F1C6D9] text-white rounded-2xl hover:bg-[#e5b0c7] transition-colors flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Check className="w-5 h-5" />
                      <span>Mark as Completed</span>
                    </motion.button>
                  ) : (
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <label className="block text-sm text-[#3d3244]">
                          How did it go? (optional)
                        </label>
                        <textarea
                          value={completionNote}
                          onChange={(e) => setCompletionNote(e.target.value)}
                          placeholder="Example: Felt energized after the walk, noticed three birds..."
                          className="w-full h-20 px-4 py-3 bg-white border-2 border-[#F1C6D9]/30 rounded-2xl text-[#3d3244] text-sm placeholder-[#B5A4AC]/50 focus:border-[#F1C6D9] focus:outline-none resize-none transition-colors"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowCompletionForm(false);
                            setCompletionNote('');
                          }}
                          className="flex-1 px-4 py-2 bg-[#e8f7f5] text-[#3d3244] rounded-2xl hover:bg-[#AED7D3] transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleMarkComplete}
                          className="flex-1 px-4 py-2 bg-[#F1C6D9] text-white rounded-2xl hover:bg-[#e5b0c7] transition-colors text-sm"
                        >
                          Save
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="bg-[#C3D162]/20 rounded-2xl p-5 text-sm text-[#B5A4AC] space-y-2">
                <p className="font-medium text-[#3d3244]">💭 Remember:</p>
                <p>
                  Thoughts may still appear throughout the day, and that's completely normal. You've
                  already done the important work of examining and reframing. Now it's time to let
                  your mind rest.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F1C6D9]/20">
              <div className="flex flex-col gap-3">
                <motion.button
                  className="w-full px-6 py-3 bg-[#F1C6D9] text-white rounded-full hover:bg-[#e5b0c7] transition-colors shadow-sm"
                  onClick={onFinishEarly}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Finish Reflection Early
                </motion.button>
                <motion.button
                  className="w-full px-6 py-3 bg-[#e8f7f5] text-[#3d3244] rounded-full hover:bg-[#AED7D3] transition-colors"
                  onClick={onViewHistory}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Past Reflections (30+ days old)
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Completed Activities */}
          {completedActivities && completedActivities.length > 0 && (
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 space-y-4 border border-[#F1C6D9]/20 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <h2 className="text-lg text-[#3d3244] font-medium">
                Recently Completed Activities 🎉
              </h2>
              <div className="space-y-3">
                {completedActivities.slice(-5).reverse().map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-[#AED7D3]/20 rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[#3d3244] font-medium flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#F1C6D9]" />
                        {activity.activityTitle}
                      </p>
                      <p className="text-xs text-[#B5A4AC]">
                        {format(new Date(activity.completedAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {activity.note && (
                      <p className="text-sm text-[#B5A4AC] italic ml-6">
                        "{activity.note}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
