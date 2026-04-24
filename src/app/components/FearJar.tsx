import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Eye, Plus, Sparkles, X } from 'lucide-react';
import { FearEntry } from '../types';
import AppleMascot from './AppleMascot';
import AnimatedJar from './AnimatedJar';
import FoldingNote from './FoldingNote';

interface FearJarProps {
  fears: FearEntry[];
  onAddFear: (fear: string, counterArgument: string) => void;
  onRemoveFear: (id: string) => void;
  onBack: () => void;
}

const counterArgumentTips = [
  'Focus on observable facts instead of the loudest feeling.',
  'Look for past evidence that contradicts the worry.',
  'Write what you would tell a close friend with this fear.',
  'Validate the fear, then question whether it is accurate.',
];

const formatFearDate = (createdAt: number) => {
  if (!createdAt) return 'Saved recently';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(createdAt));
};

export default function FearJar({ fears, onAddFear, onRemoveFear, onBack }: FearJarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newFear, setNewFear] = useState('');
  const [counterArgument, setCounterArgument] = useState('');
  const [expandedFear, setExpandedFear] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animatingFear, setAnimatingFear] = useState('');
  const [animatingCounter, setAnimatingCounter] = useState('');
  const [showList, setShowList] = useState(false);

  const canSubmit = Boolean(newFear.trim() && counterArgument.trim());
  const latestFear = fears[fears.length - 1];

  const handleSubmit = () => {
    if (!canSubmit) return;

    setAnimatingFear(newFear.trim());
    setAnimatingCounter(counterArgument.trim());
    setShowAnimation(true);
    setIsAdding(false);
    setNewFear('');
    setCounterArgument('');
  };

  const handleAnimationComplete = () => {
    if (animatingFear && animatingCounter) {
      onAddFear(animatingFear, animatingCounter);
      setAnimatingFear('');
      setAnimatingCounter('');
    }

    setShowAnimation(false);
  };

  return (
    <div className="relative min-h-full px-4 py-6 sm:px-6 sm:py-10">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <div className="mb-8 flex items-center gap-4">
          <motion.button
            onClick={onBack}
            aria-label="Go back"
            className="grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-white/70 text-[#A994A1] shadow-sm backdrop-blur-sm transition-colors hover:text-[#D994B2]"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs uppercase tracking-[0.28em] text-[#B5A4AC]">gentle evidence bank</p>
            <h1 className="text-3xl text-[#3d3244] sm:text-4xl">Fear Jar</h1>
            <p className="mt-1 max-w-xl text-[#A994A1]">
              Fold worries away after pairing them with grounded counter-evidence.
            </p>
          </div>
          <AppleMascot emotion={showAnimation ? 'writing' : 'encouraging'} size="sm" className="hidden sm:flex" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-start">
          <motion.section
            className="relative overflow-hidden rounded-[2.25rem] border border-white/75 bg-white/60 p-4 shadow-[0_28px_80px_rgba(181,164,172,0.18)] backdrop-blur-md sm:p-7"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, duration: 0.56 }}
          >
            <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-[#AED7D3]/28 blur-3xl" />
            <div className="absolute -right-12 bottom-10 h-52 w-52 rounded-full bg-[#F1C6D9]/24 blur-3xl" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-1">
              <div>
                <p className="text-sm font-medium text-[#3d3244]">Your sealed jar</p>
                <p className="text-sm text-[#A994A1]">
                  {fears.length > 0
                    ? `${fears.length} ${fears.length === 1 ? 'fear is' : 'fears are'} stored with counter-evidence.`
                    : 'Empty and ready for the first folded note.'}
                </p>
              </div>
              <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#B5A4AC] shadow-sm">
                calm storage
              </div>
            </div>

            <div className="relative z-10 mt-3">
              <AnimatePresence>
                {showAnimation && animatingFear && (
                  <FoldingNote text={animatingFear} onComplete={handleAnimationComplete} />
                )}
              </AnimatePresence>
              <AnimatedJar fears={fears} isAnimating={showAnimation} />
            </div>

            <div className="relative z-10 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[#B5A4AC]">notes inside</p>
                <p className="mt-2 text-2xl text-[#3d3244]">{fears.length}</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[#B5A4AC]">latest fold</p>
                <p className="mt-2 text-lg text-[#3d3244]">{latestFear ? formatFearDate(latestFear.createdAt) : 'None yet'}</p>
              </div>
            </div>
          </motion.section>

          <div className="space-y-4">
            <motion.div
              className="rounded-[2rem] border border-white/75 bg-white/70 p-6 shadow-[0_18px_50px_rgba(181,164,172,0.14)] backdrop-blur-md"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16, duration: 0.5 }}
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-[#F8E4ED] text-[#D994B2]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl text-[#3d3244]">Make the worry smaller</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#A994A1]">
                    Name the fear, then immediately add a logical counter-argument. The point is not to erase
                    the feeling. It is to store evidence that the fear is not the whole story.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-[#EEF8EE]/80 p-4">
                <p className="text-sm font-medium text-[#3d3244]">A strong counter-argument should:</p>
                <ul className="mt-3 space-y-2">
                  {counterArgumentTips.map((tip) => (
                    <li key={tip} className="flex gap-3 text-sm leading-relaxed text-[#8F7E89]">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#C3D162]" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {!isAdding ? (
                <motion.button
                  key="add-button"
                  onClick={() => setIsAdding(true)}
                  className="group w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#F1C6D9] via-[#E9B7CD] to-[#D994B2] p-[1px] shadow-[0_18px_45px_rgba(217,148,178,0.32)]"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center justify-center gap-3 rounded-[1.95rem] bg-[#F1C6D9]/55 px-7 py-5 text-white transition-colors group-hover:bg-transparent">
                    <Plus className="h-5 w-5" />
                    <span className="text-lg font-medium">Add a Fear</span>
                  </span>
                </motion.button>
              ) : (
                <motion.div
                  key="add-form"
                  className="rounded-[2rem] border border-white/75 bg-white/82 p-5 shadow-[0_20px_60px_rgba(181,164,172,0.2)] backdrop-blur-md sm:p-6"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.98 }}
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#B5A4AC]">new note</p>
                      <h2 className="mt-1 text-xl text-[#3d3244]">Add to the jar</h2>
                    </div>
                    <button
                      onClick={() => {
                        setIsAdding(false);
                        setNewFear('');
                        setCounterArgument('');
                      }}
                      aria-label="Close new fear entry form"
                      className="grid h-10 w-10 place-items-center rounded-full bg-[#F8E4ED] text-[#A994A1] transition-colors hover:text-[#D994B2]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-[#3d3244]">What fear is asking for attention?</span>
                      <textarea
                        value={newFear}
                        onChange={(event) => setNewFear(event.target.value)}
                        placeholder="Example: I am afraid I will fail my exam."
                        className="h-24 w-full resize-none rounded-3xl border border-[#F1C6D9]/45 bg-white px-5 py-4 text-[#3d3244] outline-none transition-colors placeholder:text-[#B5A4AC]/55 focus:border-[#D994B2]"
                        autoFocus
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-[#3d3244]">What evidence can answer it?</span>
                      <textarea
                        value={counterArgument}
                        onChange={(event) => setCounterArgument(event.target.value)}
                        placeholder="Example: I studied, I passed similar exams before, and one exam will not define me."
                        className="h-32 w-full resize-none rounded-3xl border border-[#F1C6D9]/45 bg-white px-5 py-4 text-[#3d3244] outline-none transition-colors placeholder:text-[#B5A4AC]/55 focus:border-[#D994B2]"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <motion.button
                      className="flex-1 rounded-full bg-[#EEF8EE] px-7 py-3 text-[#3d3244] transition-colors hover:bg-[#DFF1DC]"
                      onClick={() => {
                        setIsAdding(false);
                        setNewFear('');
                        setCounterArgument('');
                      }}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      className={`flex-1 rounded-full px-7 py-3 transition-all ${
                        canSubmit
                          ? 'bg-[#D994B2] text-white shadow-[0_12px_26px_rgba(217,148,178,0.28)] hover:bg-[#C783A2]'
                          : 'cursor-not-allowed bg-[#EEF8EE] text-[#B5A4AC]'
                      }`}
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      whileHover={canSubmit ? { scale: 1.015 } : {}}
                      whileTap={canSubmit ? { scale: 0.98 } : {}}
                    >
                      Fold into jar
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {fears.length > 0 ? (
              <motion.button
                onClick={() => setShowList((value) => !value)}
                className="w-full rounded-[2rem] border border-white/75 bg-white/75 px-6 py-4 text-[#3d3244] shadow-sm backdrop-blur-md transition-colors hover:bg-white"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.4 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-3">
                  <Eye className="h-5 w-5 text-[#D994B2]" />
                  <span>{showList ? 'Hide notes' : `View notes in jar (${fears.length})`}</span>
                </span>
              </motion.button>
            ) : (
              !isAdding && (
                <motion.div
                  className="rounded-[2rem] border border-white/75 bg-white/62 p-5 text-center text-sm leading-relaxed text-[#A994A1] shadow-sm backdrop-blur-md"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26, duration: 0.4 }}
                >
                  Your jar is empty. Add one fear and pair it with a grounded answer.
                </motion.div>
              )
            )}
          </div>
        </div>

        <AnimatePresence>
          {showList && fears.length > 0 && (
            <motion.section
              className="mt-6 rounded-[2.25rem] border border-white/75 bg-white/60 p-4 shadow-[0_24px_70px_rgba(181,164,172,0.14)] backdrop-blur-md sm:p-6"
              initial={{ opacity: 0, y: 18, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ duration: 0.42 }}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#B5A4AC]">inside the jar</p>
                  <h2 className="mt-1 text-2xl text-[#3d3244]">
                    {fears.length} saved {fears.length === 1 ? 'note' : 'notes'}
                  </h2>
                </div>
                <p className="max-w-sm text-sm text-[#A994A1]">
                  Open a note to read the counter-evidence you saved with it.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {fears.map((fear, index) => {
                  const isExpanded = expandedFear === fear.id;

                  return (
                    <motion.article
                      key={fear.id}
                      className="rounded-[1.75rem] border border-white/75 bg-white/78 p-5 shadow-sm transition-shadow hover:shadow-md"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.045, duration: 0.34 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          onClick={() => setExpandedFear(isExpanded ? null : fear.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="text-sm text-[#B5A4AC]">{formatFearDate(fear.createdAt)}</p>
                          <p className="mt-2 line-clamp-3 font-medium leading-relaxed text-[#3d3244]">{fear.fear}</p>
                        </button>
                        <button
                          onClick={() => onRemoveFear(fear.id)}
                          aria-label={`Remove fear: ${fear.fear}`}
                          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-[#F8E4ED] text-[#A994A1] transition-colors hover:text-[#D994B2]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.28 }}
                          >
                            <div className="mt-5 border-t border-[#F1C6D9]/24 pt-4">
                              <p className="text-sm font-medium text-[#3d3244]">Counter-evidence</p>
                              <div className="mt-3 rounded-3xl bg-gradient-to-br from-[#EEF8EE] to-[#E8F7F5] p-4">
                                <p className="text-sm leading-relaxed text-[#5B4D57]">{fear.counterArgument}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
