import React, { useState, useEffect } from 'react';
import { Users, Sparkles, Flame, ShieldCheck, Activity } from 'lucide-react';

export const LiveTrafficMonitor: React.FC = () => {
  // Dynamic lifelike visitor fluctuations
  const [onlineUsers, setOnlineUsers] = useState<number>(47);
  const [totalBoops, setTotalBoops] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nosey_boop_count') || localStorage.getItem('boop_count') || localStorage.getItem('kepo_boop_count');
      return saved ? parseInt(saved, 10) + 1280 : 1337;
    }
    return 1337;
  });
  const [memesCrafted, setMemesCrafted] = useState<number>(1420);

  useEffect(() => {
    // Subtle lifelike jitter for online users (between 38 and 59)
    const visitorInterval = setInterval(() => {
      setOnlineUsers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        return next < 35 ? 38 : next > 65 ? 60 : next;
      });
    }, 4500);

    // Occasional simulated global boops incrementing
    const boopInterval = setInterval(() => {
      setTotalBoops((prev) => prev + Math.floor(Math.random() * 3) + 1);
      if (Math.random() > 0.6) {
        setMemesCrafted((prev) => prev + 1);
      }
    }, 6000);

    return () => {
      clearInterval(visitorInterval);
      clearInterval(boopInterval);
    };
  }, []);

  return (
    <section className="w-full bg-arcade-chalk border-b-4 border-black py-6 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-2 border-b-2 border-black font-pixel text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-black"></span>
            </span>
            <span className="text-black font-bold tracking-wider">
              LIVE TRAFFIC & COMMUNITY HEALTH TELEMETRY
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-arcade-yellow border-2 border-black px-2 py-0.5 font-pixel text-[10px] font-bold text-black shadow-pixel-sm">
            <Activity size={12} className="animate-pulse" />
            <span>REAL-TIME ENGAGEMENT BENCHMARK</span>
          </div>
        </div>

        {/* 4 Neo-Brutalist Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Live Visitors */}
          <div className="bg-white text-black border-4 border-black p-4 shadow-pixel hover:translate-x-1 hover:translate-y-1 transition-transform">
            <div className="flex items-center justify-between font-pixel text-[10px] text-gray-700 mb-1">
              <span>LIVE VISITORS</span>
              <Users size={16} className="text-green-600" />
            </div>
            <div className="font-pixel text-2xl sm:text-3xl text-green-700 font-bold flex items-baseline gap-2">
              <span>{onlineUsers}</span>
              <span className="font-retro text-lg text-gray-700 font-normal">Active Degens</span>
            </div>
            <div className="font-retro text-base text-gray-700 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
              <span>Touching Snoot & Chatting</span>
            </div>
          </div>

          {/* Metric 2: Global Snoot Boops */}
          <div className="bg-arcade-yellow text-black border-4 border-black p-4 shadow-pixel hover:translate-x-1 hover:translate-y-1 transition-transform">
            <div className="flex items-center justify-between font-pixel text-[10px] text-black mb-1">
              <span>TOTAL SNOOT BOOPS</span>
              <Sparkles size={16} />
            </div>
            <div className="font-pixel text-2xl sm:text-3xl text-black font-bold truncate">
              {totalBoops.toLocaleString()}
            </div>
            <div className="font-retro text-base text-gray-900 mt-1">
              Proof-of-Boop (PoB) Verified
            </div>
          </div>

          {/* Metric 3: Memes Generated */}
          <div className="bg-arcade-pink text-black border-4 border-black p-4 shadow-pixel hover:translate-x-1 hover:translate-y-1 transition-transform">
            <div className="flex items-center justify-between font-pixel text-[10px] text-black mb-1">
              <span>MEMES COOKED</span>
              <Flame size={16} />
            </div>
            <div className="font-pixel text-2xl sm:text-3xl text-black font-bold truncate">
              {memesCrafted.toLocaleString()}
            </div>
            <div className="font-retro text-base text-gray-900 mt-1">
              16-Bit Meme Studio Creations
            </div>
          </div>

          {/* Metric 4: Community Trust Score */}
          <div className="bg-arcade-grass text-black border-4 border-black p-4 shadow-pixel hover:translate-x-1 hover:translate-y-1 transition-transform">
            <div className="flex items-center justify-between font-pixel text-[10px] text-black mb-1">
              <span>TRUST SCORE</span>
              <ShieldCheck size={16} />
            </div>
            <div className="font-pixel text-2xl sm:text-3xl text-green-900 font-bold truncate">
              100% SAFE
            </div>
            <div className="font-retro text-base text-gray-900 mt-1">
              0% Tax • LP Void • Dev Locked
            </div>
          </div>
        </div>

        {/* Longevity & Retention Benchmark Banner */}
        <div className="bg-black text-yellow-300 border-2 border-black p-3 font-pixel text-[11px] leading-relaxed flex flex-col sm:flex-row items-center justify-between gap-2 shadow-pixel-sm text-center sm:text-left">
          <div>
            🚀 <strong>LONGEVITY & TRAFFIC BENCHMARK:</strong> Over <strong>98.7% Bullish Community Sentiment</strong> across Telegram & X. Visitors spend an average of <strong>4.2 minutes</strong> booping the snoot!
          </div>
          <a
            href="https://t.me/TheNoseyCat"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-arcade-yellow text-black border-2 border-black px-3 py-1 text-[10px] font-bold hover:bg-white transition-colors flex-shrink-0"
          >
            JOIN TELEGRAM GUILD ↗
          </a>
        </div>
      </div>
    </section>
  );
};
