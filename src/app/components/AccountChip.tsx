import { motion } from 'motion/react';
import { LogOut, UserRound } from 'lucide-react';

interface AccountChipProps {
  email: string;
  name?: string;
  onSignOut: () => void;
}

export default function AccountChip({ email, name, onSignOut }: AccountChipProps) {
  return (
    <div className="fixed right-4 top-4 z-40 sm:right-6 sm:top-6">
      <motion.div
        className="flex items-center gap-3 rounded-3xl border border-[#CF6F85]/30 bg-white/92 px-3 py-2 shadow-lg backdrop-blur-md"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#CF6F85]/25 text-[#3F473D]">
          <UserRound className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#576154]">Signed In</p>
          <p className="max-w-[130px] truncate text-sm font-medium text-[#3F473D] sm:max-w-[210px]">
            {name || email}
          </p>
          {name && (
            <p className="max-w-[130px] truncate text-xs text-[#576154] sm:max-w-[210px]">
              {email}
            </p>
          )}
        </div>

        <motion.button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDEBEC] text-[#3F473D] transition-colors hover:bg-[#C4DEDF]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
