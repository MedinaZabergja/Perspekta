import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface FoldingNoteProps {
  text: string;
  onComplete: () => void;
}

type NoteStage = 'writing' | 'creasing' | 'folding' | 'dropping' | 'done';

const stageCopy: Record<Exclude<NoteStage, 'done'>, string> = {
  writing: 'Writing the note',
  creasing: 'Adding soft creases',
  folding: 'Folding it closed',
  dropping: 'Settling it into the jar',
};

const getNoteMetrics = (stage: NoteStage) => {
  if (stage === 'writing') return { width: 292, height: 176, radius: 18 };
  if (stage === 'creasing') return { width: 248, height: 146, radius: 16 };
  if (stage === 'folding') return { width: 142, height: 82, radius: 12 };
  return { width: 70, height: 42, radius: 8 };
};

export default function FoldingNote({ text, onComplete }: FoldingNoteProps) {
  const shouldReduceMotion = useReducedMotion();
  const [stage, setStage] = useState<NoteStage>('writing');
  const metrics = getNoteMetrics(stage);

  useEffect(() => {
    if (shouldReduceMotion) {
      const timer = window.setTimeout(() => {
        setStage('done');
        onComplete();
      }, 280);

      return () => window.clearTimeout(timer);
    }

    const timers = [
      window.setTimeout(() => setStage('creasing'), 900),
      window.setTimeout(() => setStage('folding'), 1750),
      window.setTimeout(() => setStage('dropping'), 2600),
      window.setTimeout(() => {
        setStage('done');
        onComplete();
      }, 3450),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [onComplete, shouldReduceMotion]);

  if (stage === 'done') return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-start justify-center overflow-hidden pt-4">
      <motion.div
        className="relative"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -24, scale: 0.92, rotate: -2 }}
        animate={{
          opacity: stage === 'dropping' ? [1, 1, 0] : 1,
          y:
            stage === 'writing'
              ? -10
              : stage === 'creasing'
                ? 8
                : stage === 'folding'
                  ? 34
                  : 178,
          x: stage === 'dropping' ? [0, 10, -4] : 0,
          scale:
            stage === 'writing'
              ? 1
              : stage === 'creasing'
                ? 0.9
                : stage === 'folding'
                  ? 0.72
                  : 0.5,
          rotate:
            stage === 'writing'
              ? -1
              : stage === 'creasing'
                ? 1
                : stage === 'folding'
                  ? -7
                  : 28,
        }}
        transition={{
          duration: stage === 'dropping' ? 0.78 : 0.72,
          ease: stage === 'dropping' ? 'easeIn' : 'easeInOut',
        }}
      >
        <motion.div
          className="relative overflow-hidden border border-[#F1C6D9]/45 bg-[#FFF8F3] shadow-[0_24px_60px_rgba(181,164,172,0.28)]"
          animate={{
            width: metrics.width,
            height: metrics.height,
            borderRadius: metrics.radius,
          }}
          transition={{ duration: 0.72, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.85),transparent_34%),linear-gradient(135deg,rgba(241,198,217,0.08),rgba(195,209,98,0.08))]" />

          <div className="absolute inset-0 p-6">
            {stage === 'writing' && (
              <div className="space-y-3">
                {[100, 82, 94].map((width, index) => (
                  <motion.div
                    key={width}
                    className="h-1 rounded-full bg-[#E8B5CB]/30"
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ delay: index * 0.16, duration: 0.48, ease: 'easeOut' }}
                  />
                ))}
                <motion.p
                  className="line-clamp-3 pt-2 text-xs italic leading-relaxed text-[#3d3244]/75"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.36 }}
                >
                  {text.substring(0, 120)}
                  {text.length > 120 ? '...' : ''}
                </motion.p>
              </div>
            )}
          </div>

          {(stage === 'creasing' || stage === 'folding' || stage === 'dropping') && (
            <>
              <motion.div
                className="absolute left-0 right-0 top-1/2 h-px bg-[#D99DB8]/70"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.35 }}
              />
              <motion.div
                className="absolute bottom-0 top-0 left-1/2 w-px bg-[#D99DB8]/55"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.12, duration: 0.35 }}
              />
              <motion.div
                className="absolute inset-x-0 top-0 h-1/2 origin-bottom bg-white/35"
                animate={{ rotateX: stage === 'folding' || stage === 'dropping' ? 72 : 0 }}
                transition={{ duration: 0.62, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-y-0 right-0 w-1/2 origin-left bg-[#FBE7F0]/55"
                animate={{ rotateY: stage === 'dropping' ? -76 : 0 }}
                transition={{ duration: 0.46, ease: 'easeInOut' }}
              />
            </>
          )}

          <motion.div
            className="absolute right-0 top-0 h-10 w-10 bg-[#F1C6D9]/18"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
            initial={{ scale: 0 }}
            animate={{ scale: stage === 'writing' ? 1 : 0.62 }}
            transition={{ delay: 0.34, duration: 0.32 }}
          />
        </motion.div>

        {stage === 'writing' && (
          <>
            <motion.span
              className="absolute -right-4 -top-4 h-5 w-5 rounded-full bg-[#C3D162]/75"
              animate={shouldReduceMotion ? undefined : { scale: [0.9, 1.18, 0.9], opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute -bottom-3 -left-3 h-3 w-3 rounded-full bg-[#F1C6D9]/80"
              animate={shouldReduceMotion ? undefined : { y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
      </motion.div>

      <motion.div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-[#8F7E89] shadow-sm backdrop-blur-md"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {stageCopy[stage]}
      </motion.div>
    </div>
  );
}
