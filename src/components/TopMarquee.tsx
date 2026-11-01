import React from 'react';
import { TOKEN_CONFIG } from '../config/tokenConfig';

export const TopMarquee: React.FC = () => {
  const messages = TOKEN_CONFIG.marqueeMessages;
  // Repeat array twice to create seamless loop
  const repeatedMessages = [...messages, ...messages, ...messages];

  return (
    <div className="relative w-full bg-arcade-yellow text-arcade-black border-b-4 border-black overflow-hidden py-2 select-none z-40">
      <div className="flex animate-marquee whitespace-nowrap text-xs md:text-sm font-pixel font-bold tracking-wider">
        {repeatedMessages.map((msg, index) => (
          <span key={index} className="inline-flex items-center mx-6">
            <span className="mr-3 text-red-600">★</span>
            {msg}
            <span className="ml-3 text-red-600">★</span>
          </span>
        ))}
      </div>
    </div>
  );
};

