import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ThumbsUp, ThumbsDown, Shuffle, ShieldCheck, Flame, Skull } from 'lucide-react';
import { playBoopSound, playCoinSound } from '../utils/soundEffects';

export interface ChatMessage {
  id: string;
  sender: string;
  badge: 'FAN' | 'HATER' | 'DEV' | 'BOT';
  sentiment: 'bull' | 'bear' | 'neutral';
  text: string;
  timestamp: string;
  boopCount?: number;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'SnootWhale_420',
    badge: 'FAN',
    sentiment: 'bull',
    text: 'I just booped the pink nose 100 times. My wallet balance literally feels heavier! 🚀🐾',
    timestamp: '2m ago',
    boopCount: 100,
  },
  {
    id: 'm2',
    sender: 'SaltyPaperhand',
    badge: 'HATER',
    sentiment: 'bear',
    text: 'Why are grown adults pressing a cat nose on a retro website?! This is pure degen madness...',
    timestamp: '4m ago',
    boopCount: 0,
  },
  {
    id: 'm3',
    sender: 'NoseyBot 🤖',
    badge: 'BOT',
    sentiment: 'bull',
    text: '@SaltyPaperhand Because you sold at the bottom anon! Cope harder while we send $NOSEY to Valhalla! 🔥',
    timestamp: '3m ago',
  },
  {
    id: 'm4',
    sender: 'DiamondClaws_SOL',
    badge: 'FAN',
    sentiment: 'bull',
    text: 'The rule is simple: IF YOU ENTER THE SITE, YOU MUST BOOP THE SNOOT. 0% tax, dev locked, let’s SEND IT!',
    timestamp: '6m ago',
    boopCount: 42,
  },
  {
    id: 'm5',
    sender: 'FUD_Dispenser',
    badge: 'HATER',
    sentiment: 'bear',
    text: 'Another tuxedo cat token?? What makes this different from 10,000 other cat coins?',
    timestamp: '9m ago',
    boopCount: 1,
  },
  {
    id: 'm6',
    sender: 'NoseyBot 🤖',
    badge: 'BOT',
    sentiment: 'bull',
    text: '@FUD_Dispenser Because our nose is interactive and actually detects liquidity! Show me another cat with Proof-of-Boop technology! 🐾',
    timestamp: '8m ago',
  },
  {
    id: 'm7',
    sender: 'SolanaChad',
    badge: 'FAN',
    sentiment: 'bull',
    text: 'It’s a literal crime to visit without booping Nosey’s pink snoot! Unwritten crypto law anon! 🟢',
    timestamp: '11m ago',
    boopCount: 88,
  },
];

const RANDOM_NAMES = [
  'SnootApe_69',
  'DiamondPaw_SOL',
  'WhaleBooper',
  'PinkNoseMaxi',
  'JeetCrusher',
  'SolanaPurr',
  'NoseyDegen_777',
  'CandleSniffer',
  'PumpCommander',
  'ChadBooper_99',
];

export const LiveTrollbox: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nosey_trollbox_msgs');
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_MESSAGES;
  });

  const [activeTab, setActiveTab] = useState<'ALL' | 'FANS' | 'HATERS'>('ALL');
  const [username, setUsername] = useState<string>('Anon_Booper');
  const [inputText, setInputText] = useState<string>('');
  const [selectedSentiment, setSelectedSentiment] = useState<'bull' | 'bear'>('bull');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  // Save messages to local storage
  const saveMessages = (newMsgs: ChatMessage[]) => {
    setMessages(newMsgs);
    try {
      localStorage.setItem('nosey_trollbox_msgs', JSON.stringify(newMsgs));
    } catch {
      // ignore storage error
    }
  };

  // Generate random retro degen username
  const handleRandomizeName = () => {
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setUsername(random);
    playBoopSound();
  };

  // Submit message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    playCoinSound();

    let userBoops = 0;
    try {
      const savedBoops = localStorage.getItem('nosey_boop_count') || localStorage.getItem('boop_count');
      userBoops = savedBoops ? parseInt(savedBoops, 10) : 0;
    } catch {
      // ignore
    }

    const newMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: username.trim() || 'Anon_Booper',
      badge: selectedSentiment === 'bull' ? 'FAN' : 'HATER',
      sentiment: selectedSentiment,
      text: inputText.trim(),
      timestamp: 'Just now',
      boopCount: userBoops,
    };

    const updated = [...messages, newMessage];
    saveMessages(updated);
    setInputText('');

    // If user posted as a hater, NoseyBot hilariously roasts them after 1.5s!
    if (selectedSentiment === 'bear') {
      setTimeout(() => {
        const botRoasts = [
          `@${newMessage.sender} Someone give this anon some milk! Your FUD is only fueling our next green candle! 🍼🚀`,
          `@${newMessage.sender} Detecting high sodium levels! Boop the pink nose 10 times to cure your bear disease! 🐾`,
          `@${newMessage.sender} Imagine fading $NOSEY when the snoot is this boopable... NGMI anon! 🤡`,
        ];
        const randomRoast = botRoasts[Math.floor(Math.random() * botRoasts.length)];
        const botReply: ChatMessage = {
          id: 'bot_' + Date.now(),
          sender: 'NoseyBot 🤖',
          badge: 'BOT',
          sentiment: 'bull',
          text: randomRoast,
          timestamp: 'Just now',
        };
        playBoopSound();
        saveMessages([...updated, botReply]);
      }, 1500);
    } else {
      // If fan, occasionally bot cheers
      if (Math.random() > 0.6) {
        setTimeout(() => {
          const botCheers = [
            `@${newMessage.sender} BASED DIAMOND PAW! May your green candles reach outer space! 🐾💎`,
            `@${newMessage.sender} Verified snoot booper spotted! Ape into $NOSEY and hold tight! 🔥`,
          ];
          const randomCheer = botCheers[Math.floor(Math.random() * botCheers.length)];
          const botReply: ChatMessage = {
            id: 'bot_' + Date.now(),
            sender: 'NoseyBot 🤖',
            badge: 'BOT',
            sentiment: 'bull',
            text: randomCheer,
            timestamp: 'Just now',
          };
          saveMessages([...updated, botReply]);
        }, 1200);
      }
    }
  };

  // Filter messages based on active tab
  const filteredMessages = messages.filter((msg) => {
    if (activeTab === 'FANS') return msg.sentiment === 'bull' || msg.badge === 'FAN';
    if (activeTab === 'HATERS') return msg.sentiment === 'bear' || msg.badge === 'HATER';
    return true; // 'ALL'
  });

  return (
    <section id="trollbox" className="w-full py-14 px-4 sm:px-6 lg:px-8 bg-[#18181b] text-white border-b-4 border-black select-none">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-arcade-yellow text-black border-2 border-black px-3 py-1 font-pixel text-xs shadow-pixel-sm font-bold">
            <MessageSquare size={14} />
            <span>LIVE 24/7 DEGEN TROLLBOX</span>
          </div>
          <h2 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-arcade-chalk">
            ANON COMMUNITY SHOUTBOX
          </h2>
          <p className="font-retro text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto">
            Live on-chain banter. Filter between <strong>Diamond-Paw Fans</strong> and <strong>Snoot Haters</strong> in real time!
          </p>
        </div>

        {/* Trollbox Arcade Container */}
        <div className="bg-[#09090b] border-4 border-black shadow-pixel-lg overflow-hidden flex flex-col">
          {/* Top Bar with Filter Tabs */}
          <div className="bg-[#27272a] border-b-4 border-black p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-none animate-ping" />
              <span className="font-pixel text-xs text-green-400 font-bold">LIVE FEED ONLINE</span>
            </div>

            {/* Filter Tabs: ALL, FANS, HATERS */}
            <div className="flex items-center gap-1.5 font-pixel text-[10px] sm:text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 border-2 border-black font-bold transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-arcade-yellow text-black shadow-pixel-sm'
                    : 'bg-[#3f3f46] text-gray-300 hover:bg-[#52525b]'
                }`}
              >
                🔥 ALL ({messages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('FANS')}
                className={`px-3 py-1.5 border-2 border-black font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'FANS'
                    ? 'bg-green-500 text-black shadow-pixel-sm'
                    : 'bg-[#3f3f46] text-green-400 hover:bg-[#52525b]'
                }`}
              >
                <ThumbsUp size={12} />
                <span>FANS / BULLS</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('HATERS')}
                className={`px-3 py-1.5 border-2 border-black font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'HATERS'
                    ? 'bg-red-500 text-white shadow-pixel-sm'
                    : 'bg-[#3f3f46] text-red-400 hover:bg-[#52525b]'
                }`}
              >
                <ThumbsDown size={12} />
                <span>HATERS / FUD</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div
            ref={chatScrollRef}
            className="p-4 sm:p-6 h-80 sm:h-96 overflow-y-auto space-y-3 font-mono text-xs sm:text-sm bg-[#121216]"
          >
            {filteredMessages.length === 0 ? (
              <div className="text-center py-16 text-gray-500 font-pixel text-xs">
                NO MESSAGES IN THIS FILTER YET. BE THE FIRST ANON TO SHOUT!
              </div>
            ) : (
              filteredMessages.map((m) => {
                const isFan = m.sentiment === 'bull' || m.badge === 'FAN';
                const isBot = m.badge === 'BOT';

                return (
                  <div
                    key={m.id}
                    className={`p-3 border-2 transition-all ${
                      isBot
                        ? 'bg-yellow-950/40 border-yellow-500 text-yellow-200'
                        : isFan
                        ? 'bg-green-950/30 border-green-600/70 text-gray-100'
                        : 'bg-red-950/30 border-red-600/70 text-gray-100'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {/* Sentiment Badge */}
                        {isBot ? (
                          <span className="bg-yellow-400 text-black px-1.5 py-0.5 font-pixel text-[9px] font-bold">
                            🤖 AI GUARD
                          </span>
                        ) : isFan ? (
                          <span className="bg-green-500 text-black px-1.5 py-0.5 font-pixel text-[9px] font-bold flex items-center gap-1">
                            <Flame size={10} />
                            <span>BULL FAN</span>
                          </span>
                        ) : (
                          <span className="bg-red-600 text-white px-1.5 py-0.5 font-pixel text-[9px] font-bold flex items-center gap-1">
                            <Skull size={10} />
                            <span>FUDDER</span>
                          </span>
                        )}

                        <span className="font-bold text-white font-pixel text-xs">
                          {m.sender}
                        </span>

                        {m.boopCount !== undefined && m.boopCount > 0 && (
                          <span className="text-[10px] text-pink-400 bg-black/60 px-1.5 py-0.5 border border-pink-500/50">
                            🐾 {m.boopCount} Boops
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-gray-500">{m.timestamp}</span>
                    </div>

                    <p className="font-retro text-base sm:text-lg leading-relaxed text-gray-200 pl-1">
                      {m.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="bg-[#1c1917] border-t-4 border-black p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Username selector & randomizer */}
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] text-gray-400">HANDLE:</span>
                <input
                  type="text"
                  maxLength={18}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-black text-arcade-yellow border-2 border-gray-600 px-2 py-1 font-pixel text-[10px] w-36 focus:outline-none focus:border-yellow-400"
                />
                <button
                  type="button"
                  onClick={handleRandomizeName}
                  title="Generate random degen name"
                  className="bg-[#27272a] hover:bg-[#3f3f46] text-white border border-gray-500 p-1.5 text-xs"
                >
                  <Shuffle size={12} />
                </button>
              </div>

              {/* Sentiment Toggle: Fan (Bull) vs Hater (Bear) */}
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] text-gray-400">SENTIMENT:</span>
                <button
                  type="button"
                  onClick={() => setSelectedSentiment('bull')}
                  className={`px-2.5 py-1 font-pixel text-[9px] border border-black flex items-center gap-1 font-bold ${
                    selectedSentiment === 'bull'
                      ? 'bg-green-500 text-black ring-2 ring-white'
                      : 'bg-[#27272a] text-gray-400'
                  }`}
                >
                  <ThumbsUp size={10} />
                  <span>FAN (BULL)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSentiment('bear')}
                  className={`px-2.5 py-1 font-pixel text-[9px] border border-black flex items-center gap-1 font-bold ${
                    selectedSentiment === 'bear'
                      ? 'bg-red-500 text-white ring-2 ring-white'
                      : 'bg-[#27272a] text-gray-400'
                  }`}
                >
                  <ThumbsDown size={10} />
                  <span>HATER (BEAR)</span>
                </button>
              </div>
            </div>

            {/* Message input + Send button */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  selectedSentiment === 'bull'
                    ? "Drop your bullish shoutout anon! (e.g., 'Boop the snoot for 100x gains!')..."
                    : "Drop your FUD or hate comment anon (prepare to get roasted by NoseyBot)..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={200}
                className="flex-1 bg-black text-white border-2 border-gray-600 px-3 py-2 font-mono text-sm focus:outline-none focus:border-arcade-yellow"
              />
              <button
                type="submit"
                className="px-5 bg-arcade-yellow text-black border-2 border-white font-pixel text-xs flex items-center gap-1.5 font-bold shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5"
              >
                <Send size={14} />
                <span>SHOUT!</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-green-400" />
                <span>100% ANONYMOUS DEGEN CHAT • NO WALLET CONNECTION NEEDED</span>
              </span>
              <span>FILTER ENABLED: FANS VS HATERS</span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
