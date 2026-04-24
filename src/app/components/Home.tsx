import { motion } from 'motion/react';
import AppleMascot from './AppleMascot';

interface HomeProps {
  onStartReflection: () => void;
  onViewHistory: () => void;
  onOpenFearJar: () => void;
  onReturnToReflectionMode?: () => void;
  isReflectionLocked?: boolean;
  reflectionCountdown?: string | null;
  canReturnToReflectionMode?: boolean;
}

export default function Home({
  onStartReflection,
  onViewHistory,
  onOpenFearJar,
  onReturnToReflectionMode,
  isReflectionLocked = false,
  reflectionCountdown = null,
  canReturnToReflectionMode = false,
}: HomeProps) {
  return (
    <div className="min-h-full px-4 py-8 sm:px-6 sm:py-10">
      <motion.div
        className="mx-auto flex min-h-full w-full max-w-2xl items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center gap-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <AppleMascot emotion="waving" size="lg" />
          </motion.div>

          <motion.div
            className="text-center space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-4xl text-[#3d3244]">Welcome Back</h1>
            <p className="text-lg text-[#B5A4AC]">Ready to explore a new perspective?</p>
          </motion.div>

          <motion.div
            className="w-full space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.button
              className={`w-full rounded-3xl px-8 py-6 text-white transition-all shadow-lg ${
                isReflectionLocked
                  ? 'cursor-not-allowed bg-gradient-to-br from-[#d9c4cf] to-[#cbb7c2]'
                  : 'bg-gradient-to-br from-[#F1C6D9] to-[#e5b0c7] hover:from-[#e5b0c7] hover:to-[#b88585]'
              }`}
              onClick={onStartReflection}
              disabled={isReflectionLocked}
              whileHover={isReflectionLocked ? {} : { scale: 1.02, y: -2 }}
              whileTap={isReflectionLocked ? {} : { scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">✨</span>
                <div className="text-left">
                  <div className="text-xl font-medium">Start a Reflection</div>
                  <div className="text-sm text-white/80">
                    {isReflectionLocked && reflectionCountdown
                      ? `Available again in ${reflectionCountdown}`
                      : 'Work through a difficult thought'}
                  </div>
                </div>
              </div>
            </motion.button>

            {canReturnToReflectionMode && onReturnToReflectionMode && (
              <motion.button
                className="mx-auto block rounded-full px-4 py-2 text-sm bg-[#e8f7f5] text-[#3d3244] hover:bg-[#AED7D3] transition-colors"
                onClick={onReturnToReflectionMode}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Return to Reflection Mode
              </motion.button>
            )}

            <motion.button
              className="w-full px-8 py-4 bg-white/90 backdrop-blur-sm text-[#3d3244] rounded-3xl hover:bg-white transition-all border border-[#F1C6D9]/20 shadow-sm"
              onClick={onOpenFearJar}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl">🫙</span>
                <span>Fear Jar</span>
              </div>
            </motion.button>

            <motion.button
              className="w-full px-8 py-4 bg-white/90 backdrop-blur-sm text-[#3d3244] rounded-3xl hover:bg-white transition-all border border-[#F1C6D9]/20 shadow-sm"
              onClick={onViewHistory}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl">📖</span>
                <span>View Past Reflections</span>
              </div>
            </motion.button>
          </motion.div>

          <motion.div
            className="text-center text-sm text-[#B5A4AC] max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p>
              Remember: This is a tool for gentle self-reflection, not a replacement for professional
              mental health support.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
