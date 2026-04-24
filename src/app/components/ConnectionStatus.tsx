import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, CloudOff } from 'lucide-react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          className="fixed right-4 top-20 z-50 sm:right-6 sm:top-24"
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
              isOnline
                ? 'bg-[#F1C6D9]/90 text-white'
                : 'bg-[#B5A4AC]/90 text-white'
            }`}
          >
            {isOnline ? (
              <>
                <Cloud className="w-4 h-4" />
                <span className="text-sm font-medium">Synced to cloud</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4" />
                <span className="text-sm font-medium">Offline - saving locally</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
