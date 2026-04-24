import { motion } from 'motion/react';
import { Cloud } from 'lucide-react';

interface SaveProgressBannerProps {
  onSignIn: () => void;
}

export default function SaveProgressBanner({ onSignIn }: SaveProgressBannerProps) {
  return (
    <motion.div
      className="sticky top-0 z-30 border-b border-white/20 bg-gradient-to-r from-[#F1C6D9]/95 to-[#e5b0c7]/95 px-4 py-3 text-white shadow-lg backdrop-blur-md sm:px-6"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="mx-auto flex min-h-[var(--save-banner-height)] max-w-4xl flex-col justify-center gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <Cloud className="mt-0.5 h-5 w-5 flex-shrink-0 sm:mt-0" />
          <p className="text-xs leading-5 sm:text-sm">
            To save your progress across devices, <span className="font-medium">sign in or sign up</span>
          </p>
        </div>
        <motion.button
          onClick={onSignIn}
          className="self-end rounded-full bg-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/30 sm:self-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign In
        </motion.button>
      </div>
    </motion.div>
  );
}
