"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./theme";

interface VIPMenuProps {
  isVIP: boolean;
  onClose: () => void;
}

export default function VIPMenu({ isVIP, onClose }: VIPMenuProps) {
  const theme = useTheme();

  return (
    <AnimatePresence>
      {isVIP && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Menu card */}
          <motion.div
            initial={{ scale: 0.8, rotateY: 90 }}
            animate={{ scale: 1, rotateY: 0 }}
            exit={{ scale: 0.8, rotateY: -90 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`${theme.colors.vipBg} backdrop-blur-xl border ${theme.colors.vipBorder} rounded-2xl p-6 sm:p-8 shadow-2xl`}>
              {/* VIP badge */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block text-4xl mb-2"
                >
                  {theme.menu.vipEmoji}
                </motion.div>
                <h2
                  className={`text-2xl sm:text-3xl font-bold ${theme.colors.vipTitleColor}`}
                  style={{
                    textShadow: "0 0 20px rgba(245, 158, 11, 0.5)",
                  }}
                >
                  {theme.menu.vipTitle}
                </h2>
                <p className="text-xs text-amber-600 font-mono mt-1">
                  {theme.menu.vipSubtitle}
                </p>
              </div>

              {/* Menu items */}
              <div className="space-y-4">
                {theme.menu.vipItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className={`border-b ${theme.colors.vipBorder} pb-3 last:border-0`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm sm:text-base font-bold ${theme.colors.vipItemColor}`}>
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-amber-600 font-mono whitespace-nowrap flex-shrink-0">
                        {item.price}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                    <p className="text-[10px] text-amber-700 font-mono mt-1">
                      {item.strength}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-[10px] text-gray-600 font-mono">
                  ↑↑↓↓←→←→BA to toggle VIP mode
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 text-xs text-gray-500 hover:text-amber-400 transition-colors"
                >
                  Close Menu
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
