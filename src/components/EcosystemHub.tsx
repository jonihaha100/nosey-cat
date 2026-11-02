import React, { useState, useRef } from 'react';
import { Play, Download, Share2, Sparkles, ShieldCheck, Cpu, Film } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import { playBoopSound, playPowerUpSound } from '../utils/soundEffects';

interface MoodItem {
  id: string;
  name: string;
  tag: string;
  img: string;
  desc: string;
}

const MOODS: MoodItem[] = [
  { id: '1', name: 'CHILL CAT', tag: 'DEFAULT SNOOT', img: '/mascot-pixel.png', desc: 'Relaxed, humble, curious 16-bit tuxedo cat watching the charts.' },
  { id: '2', name: 'THUG LIFE', tag: 'DEGEN SHADES', img: '/banners/kepo-cat-landscape-genesis.jpg', desc: 'Equipped with black pixel shades, anti-fud attitude.' },
  { id: '3', name: 'LASER EYES', tag: '1,000,000 WATTS', img: '/animations/nosey-laser-boop.gif', desc: 'Vaporizing sniper bots and jeets with pure Solana alpha beams.' },
  { id: '4', name: 'MOON MISSION', tag: 'ROCKET TO MOON', img: '/banners/nosey-moon-mission.png', desc: 'Watching green parabolic candles blast toward the 16-bit moon.' },
  { id: '5', name: 'DEGEN STATION', tag: '24/7 LAB GRIND', img: '/banners/nosey-degen-battle-station.png', desc: 'Surrounded by CRT monitors, pizza, and zero-tax Solana charts.' },
  { id: '6', name: 'DIAMOND PAWS', tag: 'ANTI-JEET SHIELD', img: '/banners/nosey-saga-ch3-diamond-paws.jpg', desc: 'Unshakable conviction. The first 50 Diamond Paws Genesis.' },
];

export const EcosystemHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trailer' | 'ecosystem' | 'target' | 'moods'>('trailer');
  const [videoFormat, setVideoFormat] = useState<'vertical' | 'landscape'>('vertical');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      playPowerUpSound();
    }
  };

  const handleTwitterShare = () => {
    const text = `Most meme coins give you a JPEG and a prayer. $KEPO gives you a real 16-bit arcade ecosystem on Solana! 🐾🚀\n\n🕹️ Live Retro Arcade\n🤖 24/7 AI Agent\n🔥 1B Supply, 0% Tax, 100% Burned LP\n\nWatch our high-impact vertical short:\nhttps://nosey-cat.vercel.app\n\n#Solana #KEPO #MemeCoin`;
    const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="ecosystem" className="py-12 sm:py-16 bg-black text-[#F5F2E8] border-b-4 border-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top HUD Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-[#283826] bg-[#101610] p-3 sm:p-4 mb-8">
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-[#C8F31D]">
            <Cpu size={16} />
            <span>// ARCHITECTURE: 04</span>
            <span className="text-white/40">|</span>
            <span className="text-white">MISSION: INVESTOR TARGET & ECOSYSTEM BLUEPRINT</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#C8F31D] bg-[#1a261a] px-3 py-1 border border-[#C8F31D]/40">
            <span className="w-2 h-2 rounded-full bg-[#C8F31D] animate-ping" />
            <span>STATUS: 100% READY FOR PUMP.FUN</span>
          </div>
        </div>

        {/* Section Heading */}
        <div className="text-center mb-10">
          <h2 className="font-pixel text-2xl sm:text-3xl lg:text-4xl text-white tracking-wide mb-3">
            MORE THAN A MEME.
          </h2>
          <div className="inline-block bg-[#C8F31D] text-black font-pixel text-sm sm:text-base lg:text-lg px-4 py-1.5 shadow-[4px_4px_0_#2457D6] mb-4">
            A COMPLETE 16-BIT RETRO ECOSYSTEM
          </div>
          <p className="font-retro text-sm sm:text-base text-[#8B9B85] max-w-2xl mx-auto">
            Terinspirasi dari standar Web3 modern seperti <span className="text-[#C8F31D] font-bold">Just A Chill Mech</span> — $KEPO hadir bukan sebagai koin low-effort, melainkan gerakan retro arcade dengan target dan acuan investor yang jelas.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 font-pixel text-xs sm:text-sm">
          <button
            onClick={() => { setActiveTab('trailer'); playBoopSound(); }}
            className={`px-4 py-2.5 border-2 border-black transition-all flex items-center gap-2 ${
              activeTab === 'trailer'
                ? 'bg-[#C8F31D] text-black shadow-[4px_4px_0_#2457D6] -translate-y-0.5'
                : 'bg-[#161D14] text-[#8B9B85] hover:text-white border-[#283826]'
            }`}
          >
            <Film size={16} />
            <span>🎬 68s INVESTOR PRESENTATION</span>
          </button>

          <button
            onClick={() => { setActiveTab('ecosystem'); playBoopSound(); }}
            className={`px-4 py-2.5 border-2 border-black transition-all flex items-center gap-2 ${
              activeTab === 'ecosystem'
                ? 'bg-[#C8F31D] text-black shadow-[4px_4px_0_#2457D6] -translate-y-0.5'
                : 'bg-[#161D14] text-[#8B9B85] hover:text-white border-[#283826]'
            }`}
          >
            <Cpu size={16} />
            <span>🌐 ECOSYSTEM NODE MAP</span>
          </button>

          <button
            onClick={() => { setActiveTab('target'); playBoopSound(); }}
            className={`px-4 py-2.5 border-2 border-black transition-all flex items-center gap-2 ${
              activeTab === 'target'
                ? 'bg-[#C8F31D] text-black shadow-[4px_4px_0_#2457D6] -translate-y-0.5'
                : 'bg-[#161D14] text-[#8B9B85] hover:text-white border-[#283826]'
            }`}
          >
            <ShieldCheck size={16} />
            <span>💎 INVESTOR SPECIFICATIONS</span>
          </button>

          <button
            onClick={() => { setActiveTab('moods'); playBoopSound(); }}
            className={`px-4 py-2.5 border-2 border-black transition-all flex items-center gap-2 ${
              activeTab === 'moods'
                ? 'bg-[#C8F31D] text-black shadow-[4px_4px_0_#2457D6] -translate-y-0.5'
                : 'bg-[#161D14] text-[#8B9B85] hover:text-white border-[#283826]'
            }`}
          >
            <Sparkles size={16} />
            <span>😼 DOZENS OF MOODS</span>
          </button>
        </div>

        {/* TAB 1: INVESTOR PRESENTATION & VERTICAL SHORT VIDEO PLAYER */}
        {activeTab === 'trailer' && (
          <div className="bg-[#141C13] border-4 border-black p-4 sm:p-6 lg:p-8 shadow-[8px_8px_0_#000]">
            
            {/* Format Switcher Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#0B0F0A] p-3 border-2 border-[#283826]">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs text-[#C8F31D]">SELECT VIDEO CUT:</span>
              </div>
              <div className="flex gap-2 font-pixel text-xs">
                <button
                  onClick={() => { setVideoFormat('vertical'); setIsPlaying(false); playBoopSound(); }}
                  className={`px-3 py-1.5 border transition-all ${
                    videoFormat === 'vertical'
                      ? 'bg-[#C8F31D] text-black border-black font-bold shadow-[2px_2px_0_#2457D6]'
                      : 'bg-[#1a261a] text-[#8B9B85] border-[#283826] hover:text-white'
                  }`}
                >
                  📱 9:16 VERTICAL SHORT (X / REELS / TELEGRAM)
                </button>
                <button
                  onClick={() => { setVideoFormat('landscape'); setIsPlaying(false); playBoopSound(); }}
                  className={`px-3 py-1.5 border transition-all ${
                    videoFormat === 'landscape'
                      ? 'bg-[#C8F31D] text-black border-black font-bold shadow-[2px_2px_0_#2457D6]'
                      : 'bg-[#1a261a] text-[#8B9B85] border-[#283826] hover:text-white'
                  }`}
                >
                  🖥️ 16:9 LANDSCAPE TRAILER
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center">
              
              {/* Video Player Box with CRT border */}
              <div className={`w-full ${videoFormat === 'vertical' ? 'lg:w-[420px] max-w-[360px]' : 'lg:w-3/5'} relative bg-black border-4 border-[#283826] overflow-hidden shadow-[6px_6px_0_#C8F31D] group mx-auto`}>
                <video
                  key={videoFormat}
                  ref={videoRef}
                  src={getAssetUrl(videoFormat === 'vertical' ? '/videos/kepo-strategy-short-9x16.mp4' : '/videos/kepo-genesis-teaser.mp4')}
                  poster={getAssetUrl(videoFormat === 'vertical' ? '/scene_1_hook.png' : '/banners/kepo-cat-landscape-genesis.jpg')}
                  controls
                  playsInline
                  className={`w-full ${videoFormat === 'vertical' ? 'aspect-[9/16] object-contain' : 'aspect-video object-cover'}`}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Big Center Play Overlay Button if paused */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-[#C8F31D] border-4 border-black flex items-center justify-center shadow-[4px_4px_0_#000] hover:scale-105 transition-transform"
                    aria-label="Play Trailer"
                  >
                    <Play size={36} className="text-black fill-black ml-1" />
                  </button>
                )}
              </div>

              {/* Video Context & Action Buttons */}
              <div className="w-full lg:flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block bg-[#2457D6] text-white font-mono text-[10px] px-2.5 py-1 uppercase tracking-wider mb-3">
                    {videoFormat === 'vertical' ? 'WALBI × FXPRO × GATEKID3 VIRAL CUT (1080x1920)' : 'OFFICIAL X INVESTOR PRESENTATION (1080P HD)'}
                  </div>
                  <h3 className="font-pixel text-xl sm:text-2xl text-white mb-3">
                    {videoFormat === 'vertical' ? '$KEPO: THE 16-BIT MEME COIN WITH REAL VALUE' : "$KEPO — MORE THAN A MEME, IT'S A MOVEMENT."}
                  </h3>
                  <p className="font-retro text-sm text-[#8B9B85] mb-4 leading-relaxed">
                    {videoFormat === 'vertical'
                      ? 'Format vertikal (9:16) berkecepatan tinggi yang dirancang khusus untuk feed X (Twitter), Shorts, dan Telegram. Menggabungkan arsitektur AI Walbi (pembuktian utilitas langsung), presisi FxPro (kepercayaan institusional matematika 0% tax & burned LP), serta visual animasi pixel ekspresif ala Gatekid3.'
                      : 'Video presentasi resmi berdurasi 68 detik berstandar tinggi yang merangkum 7 pilar: Dozens of Moods, pembuktian anti-rug (0% tax, LP burn), Step 01 (50 Diamond Paws Assembly), Step 02 (Fair Launch Tokenomics & Math), Arsitektur 6 Node Ekosistem, Live Website Proof, dan Launchpad Outro.'}
                  </p>

                  <div className="space-y-2 font-mono text-xs text-white/80 mb-6 bg-[#0B0F0A] p-3 border border-[#283826]">
                    <div className="flex justify-between">
                      <span className="text-[#8B9B85]">ASPECT RATIO:</span>
                      <span className="text-[#C8F31D]">{videoFormat === 'vertical' ? '1080x1920 Vertical (9:16)' : '1920x1080 Full HD (16:9)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B9B85]">DURASI:</span>
                      <span className="text-white">{videoFormat === 'vertical' ? '30.0 Detik (Fast-Paced High Retention)' : '68.2 Detik (Full Deck Breakdown)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B9B85]">STRATEGY:</span>
                      <span className="text-[#C8F31D]">Walbi Utility + FxPro Trust + Gatekid3 16-Bit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B9B85]">AUDIO:</span>
                      <span className="text-white">Stereo 48kHz High-Octane Arcade Synth</span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={getAssetUrl(videoFormat === 'vertical' ? '/videos/kepo-strategy-short-9x16.mp4' : '/videos/kepo-genesis-teaser.mp4')}
                    download={videoFormat === 'vertical' ? 'kepo-strategy-short-9x16.mp4' : 'kepo-genesis-presentation-1080p.mp4'}
                    className="flex-1 py-3 px-4 bg-[#C8F31D] text-black font-pixel text-xs text-center border-2 border-black shadow-[4px_4px_0_#000] hover:bg-[#d9ff4a] transition-all flex items-center justify-center gap-2 font-bold"
                  >
                    <Download size={16} />
                    <span>DOWNLOAD VIDEO (.MP4)</span>
                  </a>

                  <button
                    onClick={handleTwitterShare}
                    className="flex-1 py-3 px-4 bg-[#2457D6] text-white font-pixel text-xs text-center border-2 border-black shadow-[4px_4px_0_#000] hover:bg-blue-600 transition-all flex items-center justify-center gap-2 font-bold"
                  >
                    <Share2 size={16} />
                    <span>SHARE KE X (@TheNoseyCat)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ECOSYSTEM NODE NETWORK */}
        {activeTab === 'ecosystem' && (
          <div className="bg-[#141C13] border-4 border-black p-6 sm:p-8 lg:p-10 shadow-[8px_8px_0_#000]">
            <div className="text-center mb-8">
              <h3 className="font-pixel text-xl sm:text-2xl text-white mb-2">
                THE $KEPO CONNECTED ARCHITECTURE
              </h3>
              <p className="font-retro text-sm text-[#8B9B85]">
                Bukan sekadar token yang dibuat 5 menit di Pump.fun. Ekosistem $KEPO memiliki 6 pilar software terintegrasi:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: '🕹️ BOOP CLICKER TERMINAL', status: 'LIVE ON WEB', color: '#C8F31D', desc: 'Game arcade boop 16-bit retro dengan counter on-chain, sound FX arcade 8-bit, dan tracking interaktif.' },
                { title: '🎨 16-BIT MEME STUDIO', status: 'LIVE ON WEB', color: '#00DCFF', desc: 'Meme generator khusus komunitas dengan aksesori thug life, red laser eyes, dan template billboard $KEPO.' },
                { title: '🤖 HERMES AI SENTINEL', status: '24/7 ONLINE', color: '#F5C518', desc: 'Bot AI @nesey_cat_bot berbasis Hermes yang santai, melayani member grup komunitas dan generate draf tweet otomatis.' },
                { title: '🚀 PUMP.FUN STEALTH DROP', status: 'PHASE 2 TARGET', color: '#FF781E', desc: 'Peluncuran adil (Fair Launch) anti-sniper bot dengan 100% supply publik dan zero insider allocation.' },
                { title: '📈 RAYDIUM MIGRATION', status: 'AUTOMATED POOL', color: '#C8F31D', desc: 'Migrasi otomatis setelah bonding curve tercapai dengan pembakaran likuiditas (LP burn) permanen.' },
                { title: '🏆 WEB3 RETRO QUESTS', status: 'PHASE 4 ROADMAP', color: '#00DCFF', desc: 'Papan peringkat global untuk diamond paws, airdrop holder retro, dan ekspansi game Web3.' },
              ].map((node, idx) => (
                <div key={idx} className="bg-[#1B2419] border-2 border-[#283826] p-5 flex flex-col justify-between hover:border-[#C8F31D] transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-[#8B9B85]">NODE #{idx + 1}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 border" style={{ color: node.color, borderColor: node.color }}>
                        {node.status}
                      </span>
                    </div>
                    <h4 className="font-pixel text-sm text-white mb-2">{node.title}</h4>
                    <p className="font-retro text-xs text-[#8B9B85] leading-relaxed">{node.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INVESTOR SPECIFICATIONS TABLE */}
        {activeTab === 'target' && (
          <div className="bg-[#141C13] border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0_#000]">
            <div className="text-center mb-8">
              <h3 className="font-pixel text-xl sm:text-2xl text-white mb-2">
                INVESTOR TARGET & ANTI-RUG SPECIFICATIONS
              </h3>
              <p className="font-retro text-sm text-[#8B9B85]">
                Parameter transparan untuk menjamin keamanan dana investor dan likuiditas jangka panjang:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#243424] text-[#C8F31D] border-b-2 border-[#283826]">
                    <th className="p-3 sm:p-4">METRIK PARAMETER</th>
                    <th className="p-3 sm:p-4">SPESIFIKASI $KEPO</th>
                    <th className="p-3 sm:p-4">STATUS KEAMANAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#283826] text-white">
                  <tr>
                    <td className="p-3 sm:p-4 text-[#8B9B85]">CURRENT MILESTONE</td>
                    <td className="p-3 sm:p-4 text-[#00DCFF] font-bold">STAGE 1: 50 DIAMOND PAWS GENESIS</td>
                    <td className="p-3 sm:p-4 text-[#C8F31D]">🟢 ACTIVE IN LAB</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 text-[#8B9B85]">NEXT EVENT</td>
                    <td className="p-3 sm:p-4 text-[#C8F31D] font-bold">STEALTH FAIR LAUNCH ON PUMP.FUN</td>
                    <td className="p-3 sm:p-4 text-[#C8F31D]">🔒 UNANNOUNCED (ANTI-SNIPER)</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 text-[#8B9B85]">TOTAL TOKEN SUPPLY</td>
                    <td className="p-3 sm:p-4 text-[#F5C518] font-bold">1,000,000,000 $KEPO (1 BILLION)</td>
                    <td className="p-3 sm:p-4 text-[#C8F31D]">FIXED IMMUTABLE</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 text-[#8B9B85]">TRANSACTION TAX</td>
                    <td className="p-3 sm:p-4 text-[#C8F31D] font-bold">0% BUY TAX / 0% SELL TAX</td>
                    <td className="p-3 sm:p-4 text-[#C8F31D]">ZERO FEE TRADING</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 text-[#8B9B85]">LIQUIDITY POOL</td>
                    <td className="p-3 sm:p-4 text-[#FF4040] font-bold">100% LP BURNED PERMANENTLY</td>
                    <td className="p-3 sm:p-4 text-[#C8F31D]">KEYS TO THE VOID</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 text-[#8B9B85]">MINT & FREEZE AUTHORITIES</td>
                    <td className="p-3 sm:p-4 text-white font-bold">FULLY REVOKED AT GENESIS</td>
                    <td className="p-3 sm:p-4 text-[#C8F31D]">IMPOSSIBLE TO MINT MORE</td>
                  </tr>
                  <tr>
                    <td className="p-3 sm:p-4 text-[#8B9B85]">TEAM ALLOCATION</td>
                    <td className="p-3 sm:p-4 text-[#C8F31D] font-bold">0% (ZERO INSIDER DUMPING)</td>
                    <td className="p-3 sm:p-4 text-[#C8F31D]">100% PUBLIC CIRCULATION</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DOZENS OF MOODS */}
        {activeTab === 'moods' && (
          <div className="bg-[#141C13] border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0_#000]">
            <div className="text-center mb-8">
              <h3 className="font-pixel text-xl sm:text-2xl text-white mb-2">
                DOZENS OF MOODS. ONE CURIOUS SNOOT.
              </h3>
              <p className="font-retro text-sm text-[#8B9B85]">
                Galeri visual karakter $KEPO untuk materi stiker Telegram, meme viral di X, dan identitas brand:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOODS.map((mood) => (
                <div key={mood.id} className="bg-[#1B2419] border-2 border-[#283826] p-4 flex flex-col justify-between group hover:border-[#C8F31D] transition-all">
                  <div className="aspect-video bg-black border border-[#283826] overflow-hidden mb-3 relative">
                    <img 
                      src={getAssetUrl(mood.img)} 
                      alt={mood.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute top-2 left-2 bg-[#C8F31D] text-black font-mono text-[9px] px-1.5 py-0.5 font-bold">
                      {mood.tag}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-pixel text-sm text-white mb-1">{mood.name}</h4>
                    <p className="font-retro text-xs text-[#8B9B85] leading-relaxed">{mood.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
