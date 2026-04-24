import { useState } from 'react';
import { motion } from 'motion/react';
import AppleMascot from './AppleMascot';

interface BalancedPerspectiveProps {
  thought: string;
  evidence: string[];
  initialPerspective?: string;
  onComplete: (perspective: string) => void;
  onBack: () => void;
}

export default function BalancedPerspective({
  thought,
  evidence,
  initialPerspective = '',
  onComplete,
  onBack,
}: BalancedPerspectiveProps) {
  const [perspective, setPerspective] = useState(initialPerspective);

  const handleComplete = () => {
    if (perspective.trim()) {
      onComplete(perspective);
    }
  };

  return (
    <div className="relative min-h-full overflow-hidden px-4 py-8 sm:px-6 sm:py-10">
      {/* Minimal blur - clarity achieved */}
      <motion.div
        className="absolute inset-0 bg-[#3d3244]/5"
        style={{ backdropFilter: 'blur(2px)' }}
        initial={{ backdropFilter: 'blur(8px)' }}
        animate={{ backdropFilter: 'blur(2px)' }}
        transition={{ duration: 1.2 }}
      />

      <motion.div
        className="relative z-10 mx-auto flex min-h-full w-full max-w-3xl items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center gap-8">
          <AppleMascot emotion="encouraging" size="md" />

          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-3xl text-[#3d3244]">Form a Balanced Perspective</h1>
            <p className="text-[#B5A4AC]">
              Considering the evidence, what's a more balanced way to view this?
            </p>
          </motion.div>

          <motion.div
            className="w-full bg-white/95 backdrop-blur-sm rounded-3xl p-8 space-y-6 border border-[#F1C6D9]/20 shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="space-y-4">
              <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#F1C6D9]/20 space-y-3">
                <div>
                  <p className="text-sm text-[#B5A4AC] mb-1">Original thought:</p>
                  <p className="text-[#3d3244] italic">"{thought}"</p>
                </div>
                <div className="border-t border-[#F1C6D9]/20 pt-3">
                  <p className="text-sm text-[#B5A4AC] mb-2">Evidence you found:</p>
                  <ul className="space-y-1">
                    {evidence.map((item, index) => (
                      <li key={index} className="flex gap-2 text-sm text-[#3d3244]">
                        <span className="text-[#F1C6D9]">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[#3d3244]">Your Balanced Perspective</label>
              <textarea
                value={perspective}
                onChange={(e) => setPerspective(e.target.value)}
                placeholder="Example: 'While I make mistakes sometimes, I also receive positive feedback and am learning and growing in my role'"
                className="w-full h-48 px-5 py-4 bg-[#ffffff] border-2 border-[#F1C6D9]/30 rounded-2xl text-[#3d3244] placeholder-[#B5A4AC]/50 focus:border-[#F1C6D9] focus:outline-none resize-none transition-colors"
                autoFocus
              />
            </div>

            <div className="bg-[#C3D162]/20 rounded-2xl p-5 text-sm text-[#3d3244] space-y-2">
              <p className="font-medium">🌟 Creating balance:</p>
              <ul className="space-y-1 text-[#B5A4AC] ml-4">
                <li>• Acknowledge both the difficulty and the evidence</li>
                <li>• Avoid extreme words like "always," "never," "completely"</li>
                <li>• Include nuance and context</li>
                <li>• Be kind to yourself</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <motion.button
                className="px-6 py-3 bg-[#e8f7f5] text-[#3d3244] rounded-full hover:bg-[#AED7D3] transition-colors"
                onClick={onBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              <motion.button
                className={`flex-1 px-8 py-3 rounded-full transition-all ${
                  perspective.trim()
                    ? 'bg-[#F1C6D9] text-white hover:bg-[#e5b0c7] shadow-sm'
                    : 'bg-[#e8f7f5] text-[#B5A4AC] cursor-not-allowed'
                }`}
                onClick={handleComplete}
                disabled={!perspective.trim()}
                whileHover={perspective.trim() ? { scale: 1.02 } : {}}
                whileTap={perspective.trim() ? { scale: 0.98 } : {}}
              >
                Complete
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
