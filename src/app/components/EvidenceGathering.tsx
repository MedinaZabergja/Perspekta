import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppleMascot from './AppleMascot';
import { Trash2 } from 'lucide-react';

interface EvidenceGatheringProps {
  thought: string;
  initialEvidence?: string[];
  onContinue: (evidence: string[]) => void;
  onBack: () => void;
}

export default function EvidenceGathering({
  thought,
  initialEvidence = [],
  onContinue,
  onBack,
}: EvidenceGatheringProps) {
  const [evidence, setEvidence] = useState<string[]>(initialEvidence.length > 0 ? initialEvidence : ['']);
  const [currentInput, setCurrentInput] = useState('');

  const addEvidence = () => {
    if (currentInput.trim()) {
      setEvidence([...evidence, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  const removeEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addEvidence();
    }
  };

  const handleContinue = () => {
    const validEvidence = evidence.filter((e) => e.trim());
    if (validEvidence.length > 0) {
      onContinue(validEvidence);
    }
  };

  const validEvidenceCount = evidence.filter((e) => e.trim()).length;
  const blurAmount = Math.max(0, 12 - validEvidenceCount * 3);

  return (
    <div className="relative min-h-full overflow-hidden px-4 py-8 sm:px-6 sm:py-10">
      {/* Reducing blur as evidence is added */}
      <motion.div
        className="absolute inset-0 bg-[#3d3244]/5"
        style={{ backdropFilter: `blur(${blurAmount}px)` }}
        animate={{ backdropFilter: `blur(${blurAmount}px)` }}
        transition={{ duration: 0.8 }}
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
            <h1 className="text-3xl text-[#3d3244]">Let's Examine the Evidence</h1>
            <p className="text-[#B5A4AC]">
              What evidence challenges or questions this thought?
            </p>
          </motion.div>

          <motion.div
            className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 space-y-6 border border-[#F1C6D9]/20 shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="bg-[#ffffff] rounded-2xl p-5 border border-[#F1C6D9]/20">
              <p className="text-sm text-[#B5A4AC] mb-2">Your thought:</p>
              <p className="text-[#3d3244] italic">"{thought}"</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-[#3d3244]">
                  Add Evidence <span className="text-[#B5A4AC] text-sm">({validEvidenceCount} added)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Example: 'I received positive feedback last week'"
                    className="flex-1 px-5 py-3 bg-[#ffffff] border-2 border-[#F1C6D9]/30 rounded-2xl text-[#3d3244] placeholder-[#B5A4AC]/50 focus:border-[#F1C6D9] focus:outline-none transition-colors"
                    autoFocus
                  />
                  <motion.button
                    className="px-6 py-3 bg-[#F1C6D9] text-white rounded-2xl hover:bg-[#e5b0c7] transition-colors"
                    onClick={addEvidence}
                    disabled={!currentInput.trim()}
                    whileHover={currentInput.trim() ? { scale: 1.02 } : {}}
                    whileTap={currentInput.trim() ? { scale: 0.98 } : {}}
                  >
                    Add
                  </motion.button>
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {evidence.filter(e => e.trim()).map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 bg-[#AED7D3]/30 rounded-2xl p-4 group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-[#F1C6D9] flex-shrink-0 mt-1">✓</span>
                    <p className="flex-1 text-[#3d3244]">{item}</p>
                    <button
                      onClick={() => removeEvidence(index)}
                      aria-label={`Remove evidence ${index + 1}`}
                      className="opacity-0 group-hover:opacity-100 text-[#B5A4AC] hover:text-[#F1C6D9] transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="bg-[#C3D162]/20 rounded-2xl p-5 text-sm text-[#3d3244] space-y-2">
              <p className="font-medium">💡 Tips for finding evidence:</p>
              <ul className="space-y-1 text-[#B5A4AC] ml-4">
                <li>• Think of times when the opposite was true</li>
                <li>• Consider what a friend might say to challenge this thought</li>
                <li>• Look for facts, not feelings</li>
                <li>• Remember your strengths and past successes</li>
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
                  validEvidenceCount > 0
                    ? 'bg-[#F1C6D9] text-white hover:bg-[#e5b0c7] shadow-sm'
                    : 'bg-[#e8f7f5] text-[#B5A4AC] cursor-not-allowed'
                }`}
                onClick={handleContinue}
                disabled={validEvidenceCount === 0}
                whileHover={validEvidenceCount > 0 ? { scale: 1.02 } : {}}
                whileTap={validEvidenceCount > 0 ? { scale: 0.98 } : {}}
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
