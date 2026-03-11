"use client";

import { motion, AnimatePresence } from "framer-motion";

interface VIPMenuProps {
  isVIP: boolean;
  onClose: () => void;
}

const COCKTAIL_MENU = [
  {
    name: "The React Martini",
    desc: "Shaken, not server-rendered. Pairs well with TypeScript Tonic.",
    strength: "████░░ Hooks you in",
    price: "0.003 ETH",
  },
  {
    name: "Python on the Rocks",
    desc: "Aged in a venv barrel. Smooth finish, occasional IndentationError aftertaste.",
    strength: "█████░ Highly effective",
    price: "Free (open source)",
  },
  {
    name: "The Docker Compose",
    desc: "A layered drink. Takes 10 minutes to build, but runs the same everywhere.",
    strength: "██████ Full container",
    price: "Your RAM",
  },
  {
    name: "Git Brandy",
    desc: "Smooth until you try to merge two of them. Conflicts guaranteed.",
    strength: "███░░░ Depends on branch",
    price: "3 merge conflicts",
  },
  {
    name: "Kubernetes Kolada",
    desc: "Nobody knows what's inside, but it auto-scales. Requires 47 YAML files to order.",
    strength: "██████ Orchestrated chaos",
    price: "Your sanity",
  },
  {
    name: "The Soju Shot (House Special)",
    desc: "Simple. Dangerous. Makes you mass-create GitHub repos at 3am.",
    strength: "██████ 참이슬 certified",
    price: "Your dignity",
  },
];

export default function VIPMenu({ isVIP, onClose }: VIPMenuProps) {
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
            <div className="bg-gradient-to-b from-amber-950/90 to-black/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
              {/* VIP badge */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block text-4xl mb-2"
                >
                  👑
                </motion.div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-amber-400"
                  style={{
                    textShadow: "0 0 20px rgba(245, 158, 11, 0.5)",
                  }}
                >
                  VIP LOUNGE
                </h2>
                <p className="text-xs text-amber-600 font-mono mt-1">
                  Bartender&apos;s Recommendation
                </p>
              </div>

              {/* Menu items */}
              <div className="space-y-4">
                {COCKTAIL_MENU.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="border-b border-amber-800/30 pb-3 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-amber-300">
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
