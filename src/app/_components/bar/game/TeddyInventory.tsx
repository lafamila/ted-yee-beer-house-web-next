"use client";

import { motion } from "framer-motion";
import type { InventoryItem } from "./types";

interface TeddyInventoryProps {
  items: InventoryItem[];
}

const EMPTY_HINTS = [
  "Talk to Teddy",
  "Inspect objects",
  "Drag gifts here",
  "Try the terminal",
];

const SLOT_IDS = [
  "slot-a",
  "slot-b",
  "slot-c",
  "slot-d",
  "slot-e",
  "slot-f",
];

export default function TeddyInventory({ items }: TeddyInventoryProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Inventory
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Things Teddy has let you keep during this shift.
          </p>
        </div>
        <span className="text-xs font-mono text-gray-500">
          {items.length}/6 slots
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SLOT_IDS.map((slotId, index) => {
          const item = items[index];

          return item ? (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/10 bg-white/5 p-3 min-h-28"
            >
              <div className="text-2xl mb-2">{item.emoji}</div>
              <h3 className="text-sm font-semibold text-white leading-tight">
                {item.name}
              </h3>
              <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                {item.description}
              </p>
              <p className="text-[10px] text-[#3994ef] mt-2 font-mono">
                from {item.source}
              </p>
            </motion.div>
          ) : (
            <div
              key={slotId}
              className="rounded-xl border border-dashed border-white/10 bg-black/10 p-3 min-h-28"
            >
              <div className="text-lg opacity-40 mb-2">□</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {EMPTY_HINTS[index % EMPTY_HINTS.length]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
