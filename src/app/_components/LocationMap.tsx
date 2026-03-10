"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const LocationMap = () => {
  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-gray-900 border border-white/10 group">
      {/* Map Placeholder Background */}
      <div className="absolute inset-0 opacity-50 bg-[url('/grid.svg')] bg-center opacity-20"></div>
      
      {/* City Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#3994ef] rounded-full blur-[60px] opacity-30 animate-pulse"></div>

      {/* Map Markers */}
      <div className="absolute inset-0">
        <MapMarker x="50%" y="50%" delay={0} label="Seoul, KR" />
        <MapMarker x="20%" y="30%" delay={1} />
        <MapMarker x="80%" y="60%" delay={2} />
        <MapMarker x="30%" y="70%" delay={1.5} />
      </div>

      {/* Overlay Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="text-xl font-bold text-white mb-1">Based in Seoul</h3>
        <p className="text-gray-400 text-sm">Open to remote opportunities worldwide</p>
      </div>
    </div>
  );
};

const MapMarker = ({ x, y, delay, label }: { x: string; y: string; delay: number; label?: string }) => (
  <motion.div
    className="absolute"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="relative group cursor-pointer">
      <div className="w-4 h-4 bg-[#3994ef] rounded-full relative z-10 border-2 border-black"></div>
      <div className="absolute inset-0 bg-[#3994ef] rounded-full animate-ping opacity-75"></div>
      
      {label && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.5 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 whitespace-nowrap"
        >
          <span className="text-xs font-medium text-white flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {label}
          </span>
        </motion.div>
      )}
    </div>
  </motion.div>
);

export default LocationMap;
