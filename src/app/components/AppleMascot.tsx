import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type AppleEmotion = 'neutral' | 'happy' | 'encouraging' | 'proud' | 'waving' | 'writing';

interface AppleMascotProps {
  emotion?: AppleEmotion;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-20 h-20',
  md: 'w-32 h-32',
  lg: 'w-40 h-40',
};

export default function AppleMascot({
  emotion = 'neutral',
  size = 'md',
  className = '',
}: AppleMascotProps) {
  const shouldReduceMotion = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const bodyGradientId = `apple-body-${id}`;
  const cheekGradientId = `apple-cheek-${id}`;
  const leafGradientId = `apple-leaf-${id}`;
  const shadowGradientId = `apple-shadow-${id}`;

  const isSmiling = emotion === 'happy' || emotion === 'proud' || emotion === 'waving';
  const isFocused = emotion === 'encouraging' || emotion === 'writing';

  const bodyAnimation = shouldReduceMotion
    ? undefined
    : {
        y: [0, -1.5, 0],
        scale: [1, 1.025, 1],
      };

  const rightArmAnimation = shouldReduceMotion
    ? undefined
    : emotion === 'waving'
      ? { rotate: [0, -92, -56, -90, -50, 0], y: [0, -1, 0] }
      : emotion === 'writing'
        ? { rotate: [10, -16, 8, -14, 10], x: [0, 1, 0] }
        : { rotate: [0, 3, 0] };

  const leftArmAnimation = shouldReduceMotion
    ? undefined
    : emotion === 'proud'
      ? { rotate: [0, 12, 0] }
      : { rotate: [0, -3, 0] };

  return (
    <motion.div
      className={`${sizeMap[size]} ${className} flex items-center justify-center`}
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.88, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 19 }}
      aria-label="Perspekta apple mascot"
    >
      <svg viewBox="0 0 120 140" className="h-full w-full overflow-visible" role="img">
        <defs>
          <radialGradient id={bodyGradientId} cx="34%" cy="24%" r="76%">
            <stop offset="0%" stopColor="#FFE7F2" />
            <stop offset="47%" stopColor="#F4BED7" />
            <stop offset="100%" stopColor="#DEA0BD" />
          </radialGradient>
          <radialGradient id={cheekGradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E890B9" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E890B9" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={leafGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DCEB70" />
            <stop offset="100%" stopColor="#8DBA4E" />
          </linearGradient>
          <radialGradient id={shadowGradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#987D8C" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#987D8C" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="60" cy="123" rx="34" ry="10" fill={`url(#${shadowGradientId})`} />

        <motion.g
          animate={shouldReduceMotion ? undefined : { y: [0, 1.5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M39 88 C35 99 34 110 40 118"
            fill="none"
            stroke="#E3A4C0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <ellipse cx="41" cy="120" rx="8" ry="5" fill="#CF8DAA" opacity="0.95" />
          <path
            d="M81 88 C86 99 86 110 80 118"
            fill="none"
            stroke="#E3A4C0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <ellipse cx="79" cy="120" rx="8" ry="5" fill="#CF8DAA" opacity="0.95" />
        </motion.g>

        <motion.g
          style={{ transformOrigin: '35px 70px' }}
          animate={leftArmAnimation}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M34 68 C20 72 14 82 15 90"
            fill="none"
            stroke="#E8A7C4"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <circle cx="15" cy="90" r="7" fill="#D994B2" />
        </motion.g>

        <motion.g
          style={{ transformOrigin: '85px 68px' }}
          animate={rightArmAnimation}
          transition={{ duration: emotion === 'writing' ? 0.82 : 2.1, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M84 68 C99 72 105 83 104 91"
            fill="none"
            stroke="#E8A7C4"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <circle cx="104" cy="91" r="7" fill="#D994B2" />
          {emotion === 'writing' && (
            <g transform="translate(103 88) rotate(-22)">
              <rect x="-2" y="-18" width="4" height="20" rx="2" fill="#3D3244" />
              <path d="M-2 2 H2 L0 8 Z" fill="#8DBA4E" />
              <path d="M0 9 C-2 13 4 13 2 17" fill="none" stroke="#D994B2" strokeWidth="1.4" strokeLinecap="round" />
            </g>
          )}
        </motion.g>

        <motion.g
          animate={bodyAnimation}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '60px 71px' }}
        >
          <motion.path
            d="M60 31
               C49 17 27 24 22 48
               C17 70 26 99 48 105
               C54 107 58 103 60 101
               C62 103 66 107 72 105
               C94 99 103 70 98 48
               C93 24 71 17 60 31 Z"
            fill={`url(#${bodyGradientId})`}
            stroke="#D998B6"
            strokeWidth="2.4"
          />

          <path
            d="M36 41 C29 54 30 74 38 88"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.28"
          />
          <path
            d="M83 40 C91 56 90 78 82 92"
            fill="none"
            stroke="#B76F91"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.1"
          />
          <ellipse cx="38" cy="68" rx="10" ry="7" fill={`url(#${cheekGradientId})`} />
          <ellipse cx="82" cy="68" rx="10" ry="7" fill={`url(#${cheekGradientId})`} />

          {isSmiling ? (
            <>
              <path d="M44 57 C48 63 53 63 57 57" fill="none" stroke="#3D3244" strokeWidth="3" strokeLinecap="round" />
              <path d="M63 57 C67 63 72 63 76 57" fill="none" stroke="#3D3244" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : isFocused ? (
            <>
              <circle cx="49" cy="58" r="3.3" fill="#3D3244" />
              <circle cx="71" cy="58" r="3.3" fill="#3D3244" />
              <path d="M44 51 C48 48 53 49 56 53" fill="none" stroke="#3D3244" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
              <path d="M64 53 C67 49 73 48 76 51" fill="none" stroke="#3D3244" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
            </>
          ) : (
            <>
              <motion.ellipse
                cx="49"
                cy="57"
                rx="3.3"
                ry="4"
                fill="#3D3244"
                animate={shouldReduceMotion ? undefined : { scaleY: [1, 1, 0.15, 1] }}
                transition={{ duration: 3.6, repeat: Infinity, repeatDelay: 1.7 }}
                style={{ transformOrigin: '49px 57px' }}
              />
              <motion.ellipse
                cx="71"
                cy="57"
                rx="3.3"
                ry="4"
                fill="#3D3244"
                animate={shouldReduceMotion ? undefined : { scaleY: [1, 1, 0.15, 1] }}
                transition={{ duration: 3.6, repeat: Infinity, repeatDelay: 1.7 }}
                style={{ transformOrigin: '71px 57px' }}
              />
            </>
          )}

          {emotion === 'proud' ? (
            <path d="M45 74 C52 84 68 84 75 74" fill="none" stroke="#3D3244" strokeWidth="3.2" strokeLinecap="round" />
          ) : isSmiling ? (
            <path d="M47 74 C53 82 67 82 73 74" fill="none" stroke="#3D3244" strokeWidth="3" strokeLinecap="round" />
          ) : (
            <path d="M48 75 C54 80 66 80 72 75" fill="none" stroke="#3D3244" strokeWidth="2.6" strokeLinecap="round" />
          )}
        </motion.g>

        <motion.g
          initial={shouldReduceMotion ? false : { scale: 0.4, rotate: -18, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.18, type: 'spring', stiffness: 220, damping: 16 }}
          style={{ transformOrigin: '62px 31px' }}
        >
          <path
            d="M58 33 C56 23 58 13 66 7"
            fill="none"
            stroke="#A1909A"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M64 22 C68 8 91 9 96 11 C91 21 77 30 64 22 Z"
            fill={`url(#${leafGradientId})`}
          />
          <path d="M69 21 C78 17 86 14 94 11" fill="none" stroke="#F6F9BD" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
        </motion.g>

        {emotion === 'proud' && (
          <motion.g
            animate={shouldReduceMotion ? undefined : { opacity: [0.25, 1, 0.25], scale: [0.92, 1.08, 0.92] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M22 34 L25 41 L32 44 L25 47 L22 54 L19 47 L12 44 L19 41 Z" fill="#F3C6D8" />
            <path d="M96 46 L98 51 L103 53 L98 55 L96 60 L94 55 L89 53 L94 51 Z" fill="#C3D162" />
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
}
