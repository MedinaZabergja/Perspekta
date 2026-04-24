import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ThoughtEntry } from '../types';
import { ArrowLeft, Calendar } from 'lucide-react';

interface ThoughtHistoryProps {
  thoughts: ThoughtEntry[];
  hiddenThoughtCount: number;
  onBack: () => void;
}

export default function ThoughtHistory({
  thoughts,
  hiddenThoughtCount,
  onBack,
}: ThoughtHistoryProps) {
  return (
    <div className="min-h-full px-4 py-8 sm:px-6 sm:py-10">
      <motion.div
        className="mx-auto max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onBack}
              aria-label="Go back"
              className="p-2 text-[#B5A4AC] hover:text-[#F1C6D9] transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div>
              <h1 className="text-3xl text-[#3d3244]">Past Reflections</h1>
              <p className="text-[#B5A4AC]">Thoughts from 30+ days ago</p>
            </div>
          </div>

          {thoughts.length === 0 ? (
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 text-center space-y-4 border border-[#F1C6D9]/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="text-6xl">🌱</div>
              <h2 className="text-2xl text-[#3d3244]">No Past Reflections Yet</h2>
              <p className="text-[#B5A4AC] max-w-md mx-auto">
                {hiddenThoughtCount > 0
                  ? `You have ${hiddenThoughtCount} saved reflection${hiddenThoughtCount === 1 ? '' : 's'}. They will appear here after 30 days, giving you space before revisiting them.`
                  : 'Your reflections will appear here after 30 days, giving you space to gain perspective before revisiting them.'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {thoughts.map((thought, index) => (
                <motion.div
                  key={thought.id}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 space-y-6 border border-[#F1C6D9]/20 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-center gap-2 text-sm text-[#B5A4AC]">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(thought.completedAt), 'MMMM d, yyyy')}</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-[#B5A4AC] mb-2">Original thought:</p>
                      <p className="text-[#3d3244] italic">"{thought.thought}"</p>
                    </div>

                    <div className="border-t border-[#F1C6D9]/20 pt-4">
                      <p className="text-sm text-[#B5A4AC] mb-2">Evidence gathered:</p>
                      <ul className="space-y-2">
                        {thought.evidence.map((item, i) => (
                          <li key={i} className="flex gap-2 text-sm text-[#3d3244]">
                            <span className="text-[#F1C6D9]">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-[#F1C6D9]/20 pt-4">
                      <p className="text-sm text-[#B5A4AC] mb-2">Balanced perspective:</p>
                      <div className="bg-gradient-to-br from-[#C3D162]/30 to-[#AED7D3]/30 rounded-2xl p-5 border border-[#F1C6D9]/20">
                        <p className="text-[#3d3244] italic">"{thought.balancedPerspective}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#ffffff] rounded-2xl p-5 space-y-2">
                    <p className="text-sm font-medium text-[#3d3244]">
                      Reflection Question:
                    </p>
                    <p className="text-sm text-[#B5A4AC]">
                      How does this thought feel to you today compared to when you first wrote it?
                      Has your perspective shifted even more?
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
