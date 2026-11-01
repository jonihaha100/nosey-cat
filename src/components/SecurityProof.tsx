import React from 'react';
import { Lock, ShieldAlert, Award, ExternalLink } from 'lucide-react';
import { TOKEN_CONFIG } from '../config/tokenConfig';

export const SecurityProof: React.FC = () => {
  return (
    <section id="security" className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-arcade-chalk border-b-4 border-black select-none">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Section Title */}
        <div className="text-center space-y-3">
          <div className="inline-block bg-arcade-yellow border-2 border-black px-3 py-1 font-pixel text-xs shadow-pixel-sm">
            🛡️ ZERO RUG-PULL GUARANTEE
          </div>
          <h2 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-black">
            ON-CHAIN SECURITY PROOFS
          </h2>
          <p className="font-retro text-xl sm:text-2xl text-gray-700 max-w-2xl mx-auto">
            Don't trust dev promises, verify on-chain. All security parameters are hardcoded and locked permanently on the Solana blockchain.
          </p>
        </div>

        {/* 3 Retro OS Window Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Dev Supply Locked */}
          <div className="bg-white border-4 border-black shadow-pixel flex flex-col justify-between">
            {/* Retro OS Window Titlebar */}
            <div className="bg-black text-white px-3 py-1.5 flex items-center justify-between font-pixel text-[11px] border-b-4 border-black">
              <span className="flex items-center gap-1.5">
                <Lock size={13} className="text-arcade-yellow" />
                <span>DEV_LOCK.SYS</span>
              </span>
              <div className="flex gap-1">
                <span className="w-3 h-3 bg-arcade-yellow border border-white text-[9px] flex items-center justify-center text-black leading-none font-bold">_</span>
                <span className="w-3 h-3 bg-red-600 border border-white text-[9px] flex items-center justify-center text-white leading-none font-bold">X</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="inline-block bg-green-200 border-2 border-black px-2 py-0.5 font-pixel text-[10px] text-green-900 mb-2 font-bold">
                  VERIFIED LOCKED
                </div>
                <h3 className="font-pixel text-base text-black mb-2">
                  DEV SUPPLY LOCKED
                </h3>
                <p className="font-retro text-xl text-gray-800 leading-relaxed">
                  Developer token allocations are transparently locked using verified third-party smart contracts (Streamflow). Dev cannot dump tokens.
                </p>
              </div>

              <a
                href={TOKEN_CONFIG.tokenLockProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full h-11 bg-arcade-yellow text-black border-4 border-black font-pixel text-xs flex items-center justify-center gap-2 shadow-pixel-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all font-bold"
              >
                <span>VIEW LOCK PROOF</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Card 2: Mint & Freeze Revoked */}
          <div className="bg-white border-4 border-black shadow-pixel flex flex-col justify-between">
            {/* Retro OS Window Titlebar */}
            <div className="bg-black text-white px-3 py-1.5 flex items-center justify-between font-pixel text-[11px] border-b-4 border-black">
              <span className="flex items-center gap-1.5">
                <ShieldAlert size={13} className="text-arcade-pink" />
                <span>MINT_REVOKE.EXE</span>
              </span>
              <div className="flex gap-1">
                <span className="w-3 h-3 bg-arcade-yellow border border-white text-[9px] flex items-center justify-center text-black leading-none font-bold">_</span>
                <span className="w-3 h-3 bg-red-600 border border-white text-[9px] flex items-center justify-center text-white leading-none font-bold">X</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="inline-block bg-blue-200 border-2 border-black px-2 py-0.5 font-pixel text-[10px] text-blue-900 mb-2 font-bold">
                  AUTHORITY REVOKED
                </div>
                <h3 className="font-pixel text-base text-black mb-2">
                  MINT & FREEZE REVOKED
                </h3>
                <p className="font-retro text-xl text-gray-800 leading-relaxed">
                  Mint Authority (creating new tokens) and Freeze Authority (blocking wallets) are permanently disabled at the smart contract level.
                </p>
              </div>

              <div className="mt-4 w-full h-11 bg-arcade-grass text-black border-4 border-black font-pixel text-xs flex items-center justify-center gap-2 shadow-pixel-sm font-bold">
                <span>STATUS: 100% IMMUTABLE</span>
              </div>
            </div>
          </div>

          {/* Card 3: 100% Fair Launch */}
          <div className="bg-white border-4 border-black shadow-pixel flex flex-col justify-between">
            {/* Retro OS Window Titlebar */}
            <div className="bg-black text-white px-3 py-1.5 flex items-center justify-between font-pixel text-[11px] border-b-4 border-black">
              <span className="flex items-center gap-1.5">
                <Award size={13} className="text-green-400" />
                <span>FAIR_LAUNCH.LOG</span>
              </span>
              <div className="flex gap-1">
                <span className="w-3 h-3 bg-arcade-yellow border border-white text-[9px] flex items-center justify-center text-black leading-none font-bold">_</span>
                <span className="w-3 h-3 bg-red-600 border border-white text-[9px] flex items-center justify-center text-white leading-none font-bold">X</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="inline-block bg-yellow-200 border-2 border-black px-2 py-0.5 font-pixel text-[10px] text-yellow-900 mb-2 font-bold">
                  COMMUNITY FIRST
                </div>
                <h3 className="font-pixel text-base text-black mb-2">
                  100% FAIR LAUNCH
                </h3>
                <p className="font-retro text-xl text-gray-800 leading-relaxed">
                  No presale, no private VC rounds, and no secret insider allocations. Everyone starts at the exact same bonding curve on Pump.fun.
                </p>
              </div>

              <div className="mt-4 w-full h-11 bg-arcade-pink text-black border-4 border-black font-pixel text-xs flex items-center justify-center gap-2 shadow-pixel-sm font-bold">
                <span>NO INSIDER DUMPS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

