import { useState } from 'react';
import { motion } from 'motion/react';
import AppleMascot from './AppleMascot';

interface ThoughtInputProps {
  initialThought?: string;
  onContinue: (thought: string) => void;
  onBack?: () => void;
}

export default function ThoughtInput({
  initialThought = '',
  onContinue,
  onBack,
}: ThoughtInputProps) {
  const [thought, setThought] = useState(initialThought);
  const [isTyping, setIsTyping] = useState(false);

  const handleContinue = () => {
    if (thought.trim()) {
      onContinue(thought);
    }
  };

  return (
    <div className="relative min-h-full overflow-hidden px-4 py-8 sm:px-6 sm:py-10">
      {/* Blur overlay - represents foggy thinking */}
      <motion.div
        className="absolute inset-0 bg-[#3F473D]/5 backdrop-blur-md"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
      />

      <motion.div
        className="relative z-10 mx-auto flex min-h-full w-full max-w-2xl items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center gap-8">
          <AppleMascot emotion={isTyping ? 'writing' : 'encouraging'} size="md" />

          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-3xl text-[#3F473D]">What's on Your Mind?</h1>
            <p className="text-[#576154]">
              Share a thought that's been troubling you. This is a safe space.
            </p>
          </motion.div>

          <motion.div
            className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 space-y-6 border border-[#CF6F85]/20 shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="space-y-3">
              <label className="block text-[#3F473D]">Your Thought</label>
              <textarea
                value={thought}
                onChange={(e) => {
                  setThought(e.target.value);
                  setIsTyping(true);
                  setTimeout(() => setIsTyping(false), 1000);
                }}
                placeholder="Example: 'I'm not good enough at my job' or 'Nobody really cares about me'"
                className="w-full h-48 px-5 py-4 bg-[#ffffff] border-2 border-[#CF6F85]/30 rounded-2xl text-[#3F473D] placeholder-[#576154]/50 focus:border-[#CF6F85] focus:outline-none resize-none transition-colors"
                autoFocus
              />
            </div>

            <div className="bg-[#959863]/20 rounded-2xl p-5 text-sm text-[#3F473D] space-y-2">
              <p className="font-medium">💭 Remember:</p>
              <ul className="space-y-1 text-[#576154] ml-4">
                <li>• Be honest with yourself</li>
                <li>• There are no wrong answers</li>
                <li>• This is just the first step toward clarity</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              {onBack && (
                <motion.button
                  className="px-6 py-3 bg-[#576154] text-white rounded-full hover:bg-[#434B41] transition-colors"
                  onClick={onBack}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
              )}
              <motion.button
                className={`flex-1 px-8 py-3 rounded-full transition-all ${
                  thought.trim()
                    ? 'bg-[#CF6F85] text-white hover:bg-[#B85D73] shadow-sm'
                    : 'bg-[#E8C9D0] text-[#9F5B6C] cursor-not-allowed'
                }`}
                onClick={handleContinue}
                disabled={!thought.trim()}
                whileHover={thought.trim() ? { scale: 1.02 } : {}}
                whileTap={thought.trim() ? { scale: 0.98 } : {}}
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
