import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FearEntry } from '../types';

interface AnimatedJarProps {
  fears: FearEntry[];
  isAnimating?: boolean;
}

const NOTE_COLORS = ['#FFF7ED', '#FDF2F8', '#F0FDFA', '#F7FEE7', '#FFF1F2'];

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

const noteLayoutFor = (fear: FearEntry, index: number) => {
  const hash = hashString(fear.id || `${fear.createdAt}-${index}`);
  const row = Math.floor(index / 4);
  const column = index % 4;

  return {
    x: 104 + column * 38 + (hash % 17) - 8,
    y: 314 - row * 25 - ((hash >> 3) % 10),
    rotate: ((hash >> 5) % 34) - 17,
    scale: 0.88 + ((hash >> 8) % 18) / 100,
    color: NOTE_COLORS[hash % NOTE_COLORS.length],
  };
};

export default function AnimatedJar({ fears, isAnimating = false }: AnimatedJarProps) {
  const shouldReduceMotion = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const visibleFears = fears.slice(-14);
  const newestFearId = visibleFears[visibleFears.length - 1]?.id;

  const glassGradientId = `jar-glass-${id}`;
  const frontGlassGradientId = `jar-front-${id}`;
  const lidGradientId = `jar-lid-${id}`;
  const glowGradientId = `jar-glow-${id}`;
  const shadowFilterId = `jar-shadow-${id}`;

  return (
    <div
      className="relative mx-auto h-[25rem] w-full max-w-[28rem] sm:h-[28rem]"
      aria-label={`Fear jar with ${fears.length} saved ${fears.length === 1 ? 'fear' : 'fears'}`}
    >
      <motion.div
        className="absolute inset-x-10 bottom-7 h-24 rounded-full bg-[#AED7D3]/25 blur-3xl"
        animate={shouldReduceMotion ? undefined : { opacity: isAnimating ? [0.35, 0.7, 0.35] : 0.35 }}
        transition={{ duration: 1.8, repeat: isAnimating ? Infinity : 0, ease: 'easeInOut' }}
      />

      <svg
        viewBox="0 0 360 430"
        className="relative z-10 h-full w-full overflow-visible"
        role="img"
      >
        <defs>
          <radialGradient id={glowGradientId} cx="50%" cy="42%" r="64%">
            <stop offset="0%" stopColor="#FDF2F8" stopOpacity="0.95" />
            <stop offset="62%" stopColor="#E8F7F5" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#E8F7F5" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={glassGradientId} x1="0%" y1="6%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.58" />
            <stop offset="46%" stopColor="#DDF3F0" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#AED7D3" stopOpacity="0.24" />
          </linearGradient>

          <linearGradient id={frontGlassGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#AED7D3" stopOpacity="0.22" />
          </linearGradient>

          <linearGradient id={lidGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7D4E4" />
            <stop offset="100%" stopColor="#DFA2BE" />
          </linearGradient>

          <filter id={shadowFilterId} x="-35%" y="-35%" width="170%" height="170%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#7FAFAA" floodOpacity="0.22" />
          </filter>
        </defs>

        <ellipse cx="180" cy="381" rx="95" ry="18" fill="#9BBFBB" opacity="0.18" />
        <circle cx="180" cy="236" r="150" fill={`url(#${glowGradientId})`} />

        <motion.g
          filter={`url(#${shadowFilterId})`}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  y: isAnimating ? [0, 0, 4, 0] : 0,
                  scale: isAnimating ? [1, 1, 1.025, 1] : 1,
                }
          }
          transition={{ duration: isAnimating ? 3.35 : 0.75, ease: 'easeInOut' }}
          style={{ transformOrigin: '180px 270px' }}
        >
          <path
            d="M112 129 C112 106 130 98 153 98 H207 C230 98 248 106 248 129 L257 310 C259 348 231 374 192 374 H168 C129 374 101 348 103 310 L112 129 Z"
            fill={`url(#${glassGradientId})`}
            stroke="#8FC9C3"
            strokeWidth="3"
          />

          <ellipse cx="180" cy="111" rx="70" ry="20" fill="#EAF8F6" opacity="0.72" />
          <ellipse cx="180" cy="111" rx="55" ry="12" fill="#BEE3DF" opacity="0.25" />

          <g opacity="0.96">
            {visibleFears.map((fear, index) => {
              const layout = noteLayoutFor(fear, index);
              const isNewest = fear.id === newestFearId;

              return (
                <motion.g
                  key={fear.id}
                  initial={
                    shouldReduceMotion
                      ? false
                      : {
                          x: 180,
                          y: 126,
                          opacity: 0,
                          scale: 0.45,
                          rotate: 0,
                        }
                  }
                  animate={{
                    x: layout.x,
                    y: layout.y,
                    opacity: 1,
                    scale: layout.scale,
                    rotate: layout.rotate,
                  }}
                  transition={{
                    delay: shouldReduceMotion ? 0 : Math.min(index * 0.035, 0.35),
                    duration: shouldReduceMotion ? 0 : 0.72,
                    type: 'spring',
                    stiffness: 120,
                    damping: 16,
                  }}
                >
                  <motion.rect
                    x="-19"
                    y="-11"
                    width="38"
                    height="22"
                    rx="4"
                    fill={layout.color}
                    stroke="#E9BDD0"
                    strokeWidth="1.2"
                    animate={
                      shouldReduceMotion || !isAnimating || !isNewest
                        ? undefined
                        : { y: [0, -5, 0], rotate: [0, -3, 0] }
                    }
                    transition={{ duration: 0.7, delay: 3.05, ease: 'easeOut' }}
                  />
                  <path d="M-19 0 H19" stroke="#E9BDD0" strokeWidth="0.8" opacity="0.5" />
                  <path d="M0 -11 V11" stroke="#E9BDD0" strokeWidth="0.8" opacity="0.38" />
                  <path d="M-14 -6 H8" stroke="#CBA4B5" strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />
                </motion.g>
              );
            })}
          </g>

          <path
            d="M112 129 C112 106 130 98 153 98 H207 C230 98 248 106 248 129 L257 310 C259 348 231 374 192 374 H168 C129 374 101 348 103 310 L112 129 Z"
            fill={`url(#${frontGlassGradientId})`}
            stroke="#8FC9C3"
            strokeWidth="2"
          />

          <path
            d="M126 139 C119 193 119 258 127 315"
            fill="none"
            stroke="#FFFFFF"
            strokeLinecap="round"
            strokeWidth="11"
            opacity="0.5"
          />
          <path
            d="M221 145 C230 202 229 265 219 326"
            fill="none"
            stroke="#FFFFFF"
            strokeLinecap="round"
            strokeWidth="5"
            opacity="0.23"
          />
          <ellipse cx="180" cy="111" rx="70" ry="20" fill="none" stroke="#7DBDB6" strokeWidth="4" />
          <path d="M113 113 C133 131 226 131 247 113" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity="0.55" />
        </motion.g>

        <motion.g
          initial={shouldReduceMotion ? false : { opacity: 0, y: -18 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  y: isAnimating ? -48 : 0,
                  rotate: isAnimating ? -10 : 0,
                  x: isAnimating ? -12 : 0,
                }
          }
          transition={{ duration: 0.62, type: 'spring', stiffness: 160, damping: 15 }}
          style={{ transformOrigin: '135px 82px' }}
        >
          <ellipse cx="180" cy="84" rx="82" ry="17" fill={`url(#${lidGradientId})`} stroke="#D793B1" strokeWidth="2.5" />
          <rect x="129" y="61" width="102" height="22" rx="10" fill="#E9B7CD" stroke="#D793B1" strokeWidth="2" />
          <ellipse cx="180" cy="62" rx="44" ry="10" fill="#F7D4E4" opacity="0.85" />
          <path d="M130 80 C149 92 211 92 230 80" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity="0.35" />
        </motion.g>

        {fears.length === 0 && (
          <motion.g
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <path
              d="M145 244 C157 232 203 232 215 244 C207 257 153 257 145 244 Z"
              fill="#FFFFFF"
              opacity="0.54"
            />
            <text x="180" y="249" textAnchor="middle" fontSize="12" fill="#9E8F99">
              ready for a note
            </text>
          </motion.g>
        )}
      </svg>

      <motion.div
        className="absolute right-4 top-5 z-20 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-center shadow-[0_12px_30px_rgba(181,164,172,0.22)] backdrop-blur-md"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.86, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.55, type: 'spring', stiffness: 190, damping: 16 }}
      >
        <p className="text-xl leading-none text-[#3d3244]">{fears.length}</p>
        <p className="mt-1 text-[0.62rem] uppercase tracking-[0.22em] text-[#B5A4AC]">in jar</p>
      </motion.div>
    </div>
  );
}
