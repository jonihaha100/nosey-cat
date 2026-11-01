import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Flame, 
  Rocket, 
  Trophy, 
  Gamepad2, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { TOKEN_CONFIG } from '../config/tokenConfig';

interface RoadmapStage {
  stage: string;
  level: string;
  title: string;
  status: 'ACTIVE' | 'UPCOMING' | 'LOCKED' | 'FINAL_BOSS';
  icon: React.ReactNode;
  badgeColor: string;
  items: {
    title: string;
    description: string;
    done: boolean;
  }[];
}

export const ArcadeRoadmap: React.FC = () => {
  const stages: RoadmapStage[] = [
    {
      stage: 'STAGE 01',
      level: 'WORLD 1-1',
      title: 'THE BOOP AWAKENING',
      status: 'ACTIVE',
      icon: <Sparkles className="w-5 h-5 text-arcade-yellow" />,
      badgeColor: 'bg-green-600 text-white animate-pulse',
      items: [
        {
          title: '16-Bit Retro Arcade App',
          description: 'Sound-synthesized interactive pink snoot booper and Chaos Laser Mode live.',
          done: true,
        },
        {
          title: '24/7 AI Autonomous Brain',
          description: 'Living Telegram Agent (@nesey_cat_bot) & 1-Click X Content Planner active.',
          done: true,
        },
        {
          title: 'Stealth Architecture Locked',
          description: '0% Dev Tax, LP Burn mechanism ready, and anti-drainer security verified.',
          done: true,
        },
        {
          title: 'Community Seeding Target',
          description: 'Gathering 50–100 true diamond paw believers in Telegram before launch.',
          done: false,
        },
      ],
    },
    {
      stage: 'STAGE 02',
      level: 'WORLD 1-2',
      title: 'STEALTH PUMP.FUN GENESIS',
      status: 'UPCOMING',
      icon: <Rocket className="w-5 h-5 text-arcade-pink" />,
      badgeColor: 'bg-yellow-400 text-black',
      items: [
        {
          title: 'Fair Stealth Launch on Pump.fun',
          description: 'Zero pre-sale, zero team allocation, 100% fair launch for the public.',
          done: false,
        },
        {
          title: 'Instant LP Void Burn',
          description: 'Initial liquidity burned into the cosmic void upon token creation.',
          done: false,
        },
        {
          title: 'Animated Pixel Raids on X',
          description: 'Coordinated community blitz across Solana crypto Twitter with viral GIFs.',
          done: false,
        },
        {
          title: 'Bonding Curve Graduation',
          description: 'Fill the Pump.fun curve and claim the King of the Hill crown!',
          done: false,
        },
      ],
    },
    {
      stage: 'STAGE 03',
      level: 'WORLD 1-3',
      title: 'RAYDIUM MIGRATION & EXPANSION',
      status: 'LOCKED',
      icon: <Flame className="w-5 h-5 text-arcade-red" />,
      badgeColor: 'bg-blue-600 text-white',
      items: [
        {
          title: 'Raydium Liquidity Pool',
          description: 'Automatic migration to Raydium DEX ($69k+ MC) with LP burned permanently.',
          done: false,
        },
        {
          title: 'DexScreener & DEXTools Verification',
          description: 'Official verified badges, logo update, and banner takeover.',
          done: false,
        },
        {
          title: 'CoinGecko & CoinMarketCap Listing',
          description: 'Fast-track tracking applications submitted upon Raydium pair establishment.',
          done: false,
        },
        {
          title: 'First Community Boop Championship',
          description: '$SOL prizes distributed to the highest boop record holders on the website!',
          done: false,
        },
      ],
    },
    {
      stage: 'STAGE 04',
      level: 'FINAL BOSS',
      title: 'ARCADE VALHALLA & CAT DOMINANCE',
      status: 'FINAL_BOSS',
      icon: <Trophy className="w-5 h-5 text-yellow-300" />,
      badgeColor: 'bg-purple-600 text-yellow-300',
      items: [
        {
          title: '"Nosey Runner" 16-Bit Mini-Game',
          description: 'Playable arcade endless runner directly inside Telegram WebApp & browser.',
          done: false,
        },
        {
          title: 'Animated Telegram & WhatsApp Stickers',
          description: 'High-voltage pixel cat sticker pack for viral peer-to-peer crypto chats.',
          done: false,
        },
        {
          title: 'Strategic Solana Cat Alliances',
          description: 'Cross-promotions and co-raids with premier feline memecoins on Solana.',
          done: false,
        },
        {
          title: 'Tier-2 CEX Listings',
          description: 'Targeted listings on centralized exchanges (MEXC / Bitget / Gate.io).',
          done: false,
        },
      ],
    },
  ];

  return (
    <section id="roadmap" className="w-full py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-black bg-arcade-dark text-white select-none relative overflow-hidden">
      {/* Background Decorative Retro Grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #00ffcc 1px, transparent 1px), linear-gradient(to bottom, #00ffcc 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Section Header with Community Question Spotlight */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-arcade-yellow text-black border-2 border-black font-pixel text-xs sm:text-sm shadow-pixel-sm">
            <Gamepad2 className="w-4 h-4" />
            <span>COMMUNITY QUESTION SPOTLIGHT</span>
          </div>

          <div className="max-w-3xl mx-auto p-4 bg-arcade-black border-4 border-black shadow-pixel-lg">
            <p className="font-pixel text-xs sm:text-sm text-arcade-pink leading-relaxed">
              &ldquo;Have you got a roadmap I can have a look at?&rdquo;
            </p>
            <p className="font-retro text-base sm:text-lg text-gray-300 mt-2">
              — Asked by early community believers. Here is our 100% transparent 4-stage investor & utility thesis that proves $NOSEY is built for sustainability, not 5-minute rugs.
            </p>
          </div>

          <h2 className="font-pixel text-2xl sm:text-3xl lg:text-4xl text-arcade-yellow tracking-wide drop-shadow-[2px_2px_0px_#000] pt-2">
            THE NOSEY CAT SAGA ROADMAP
          </h2>

          <p className="font-retro text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            A serialized narrative journey: from an alleyway street-cat on Solana with a glowing pink snoot, to an unstoppable 16-bit arcade movement.
          </p>
        </div>

        {/* Why Investors Believe: Value Comparison Matrix */}
        <div className="border-4 border-black bg-arcade-black p-5 sm:p-6 shadow-pixel-lg">
          <h3 className="font-pixel text-xs sm:text-sm text-arcade-yellow mb-4 text-center">
            ⚡️ WHY INVESTORS CHOOSE $NOSEY VS 99% DEAD MEME COINS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-pixel">
            <div className="p-4 border-2 border-red-900 bg-red-950/40 space-y-2">
              <span className="text-red-400 font-bold block border-b border-red-800 pb-1">
                ❌ 99% PUMP.FUN COPYCATS
              </span>
              <p className="font-retro text-base text-gray-300 leading-snug">
                • Static PNG, zero real software, dev abandons after 10 mins.
              </p>
              <p className="font-retro text-base text-gray-300 leading-snug">
                • Hidden insider presales, silent dead telegrams, no narrative.
              </p>
              <p className="font-retro text-base text-gray-300 leading-snug">
                • No future plans after bonding curve — pure exit liquidity trap.
              </p>
            </div>

            <div className="p-4 border-2 border-green-800 bg-green-950/40 space-y-2">
              <span className="text-arcade-green font-bold block border-b border-green-800 pb-1">
                ✅ THE NOSEY CAT ADVANTAGE
              </span>
              <p className="font-retro text-base text-gray-200 leading-snug">
                • Live 16-bit interactive arcade web software + Meme Studio.
              </p>
              <p className="font-retro text-base text-gray-200 leading-snug">
                • 24/7 AI Autonomous Brain (@nesey_cat_bot) guarding the group.
              </p>
              <p className="font-retro text-base text-gray-200 leading-snug">
                • 0% Tax, LP burned forever, Raydium migration, Telegram mini-games & CEX target.
              </p>
            </div>
          </div>
        </div>

        {/* 4-Stage Quest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {stages.map((stage, idx) => (
            <div 
              key={idx}
              className={`border-4 border-black p-6 bg-arcade-black relative shadow-pixel-lg flex flex-col justify-between transition-transform hover:-translate-y-1 ${
                stage.status === 'ACTIVE' ? 'ring-2 ring-arcade-yellow' : ''
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-4 border-b-2 border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    {stage.icon}
                    <span className="font-pixel text-xs text-arcade-yellow tracking-wider">
                      {stage.stage} • {stage.level}
                    </span>
                  </div>

                  <span className={`font-pixel text-[9px] px-2 py-0.5 border border-black shadow-pixel-sm ${stage.badgeColor}`}>
                    {stage.status === 'ACTIVE' && '● IN PROGRESS'}
                    {stage.status === 'UPCOMING' && '▲ NEXT QUEST'}
                    {stage.status === 'LOCKED' && '🔒 LOCKED'}
                    {stage.status === 'FINAL_BOSS' && '👑 FINAL BOSS'}
                  </span>
                </div>

                <h3 className="font-pixel text-base sm:text-lg text-white mb-5 tracking-wide">
                  {stage.title}
                </h3>

                {/* Quest Checklist Items */}
                <div className="space-y-3.5">
                  {stage.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {item.done ? (
                          <CheckCircle2 className="w-4 h-4 text-arcade-green" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className={`font-pixel text-xs leading-relaxed ${item.done ? 'text-arcade-green line-through opacity-80' : 'text-gray-100'}`}>
                          {item.title}
                        </div>
                        <p className="font-retro text-sm text-gray-400 leading-snug mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage Progress Footnote */}
              <div className="mt-6 pt-4 border-t border-gray-900 flex items-center justify-between text-xs font-pixel text-gray-400">
                <span>
                  {stage.items.filter(i => i.done).length} / {stage.items.length} COMPLETED
                </span>
                <span className={stage.status === 'ACTIVE' ? 'text-arcade-yellow' : 'text-gray-500'}>
                  {stage.status === 'ACTIVE' ? 'ACTIVE RIGHT NOW' : 'PENDING STAGE'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Anti-Rug Transparency Guarantee Banner */}
        <div className="p-6 border-4 border-black bg-arcade-grass text-black shadow-pixel-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 bg-arcade-yellow border-2 border-black flex items-center justify-center flex-shrink-0 shadow-pixel-sm">
              <ShieldCheck className="w-7 h-7 text-black" />
            </div>
            <div>
              <h4 className="font-pixel text-sm sm:text-base text-black">
                100% COMMUNITY-DRIVEN & DEGEN-TRANSPARENT
              </h4>
              <p className="font-retro text-base text-gray-800 mt-1">
                No fake corporate promises. We build real 16-bit interactive software, zero taxes, and let the meme community steer the ship.
              </p>
            </div>
          </div>

          <a
            href={TOKEN_CONFIG.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-pixel text-xs px-5 py-3 bg-arcade-yellow hover:bg-yellow-300 text-black border-2 border-black shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5 transition-all whitespace-nowrap flex-shrink-0"
          >
            <span>JOIN THE INNER CIRCLE</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
