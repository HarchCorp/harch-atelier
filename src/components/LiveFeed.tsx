'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface FeedItem {
  id: number;
  timestamp: string;
  type: 'info' | 'data' | 'system';
  message: string;
  vertical?: string;
}

function getTimestamp() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

export function LiveFeed() {
  const t = useTranslations('liveFeed');

  const feedMessages: Omit<FeedItem, 'id' | 'timestamp'>[] = [
    { type: 'data', message: t('messages.0'), vertical: '/0.1' },
    { type: 'info', message: t('messages.1'), vertical: '/0.2' },
    { type: 'system', message: t('messages.2'), vertical: '/0.3' },
    { type: 'data', message: t('messages.3'), vertical: '/0.4' },
    { type: 'info', message: t('messages.4'), vertical: '/0.5' },
    { type: 'system', message: t('messages.5'), vertical: '/0.6' },
    { type: 'data', message: t('messages.6'), vertical: '/0.7' },
    { type: 'system', message: t('messages.7'), vertical: '/0.1' },
    { type: 'info', message: t('messages.8'), vertical: '/0.3' },
    { type: 'data', message: t('messages.9'), vertical: '/0.7' },
    { type: 'system', message: t('messages.10'), vertical: '/0.0' },
    { type: 'info', message: t('messages.11'), vertical: '/0.2' },
    { type: 'data', message: t('messages.12'), vertical: '/0.4' },
    { type: 'system', message: t('messages.13'), vertical: '/0.5' },
    { type: 'info', message: t('messages.14'), vertical: '/0.6' },
  ];

  const [items, setItems] = useState<FeedItem[]>(() => feedMessages.slice(0, 4).map((msg, i) => ({
    ...msg,
    id: i,
    timestamp: getTimestamp(),
  })));
  const [counter, setCounter] = useState(4);

  useEffect(() => {
    // Add new items periodically
    const interval = setInterval(() => {
      setCounter(prev => {
        const next = prev % feedMessages.length;
        const newItem: FeedItem = {
          ...feedMessages[next],
          id: prev,
          timestamp: getTimestamp(),
        };
        setItems(prevItems => {
          const updated = [...prevItems, newItem];
          return updated.slice(-5); // Keep only last 5
        });
        return prev + 1;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [feedMessages.length]);

  const typeColor = (type: string) => {
    switch(type) {
      case 'data': return 'rgba(255,255,255,0.5)';
      case 'info': return 'rgba(255,255,255,0.35)';
      case 'system': return 'rgba(255,255,255,0.25)';
      default: return '#666666';
    }
  };

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0A0A0A] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#666666] font-[family-name:var(--font-space-mono)]">
            {t('systemFeed')}
          </span>
        </div>
        <span className="text-[8px] text-[#444444] font-[family-name:var(--font-space-mono)]">
          {getTimestamp()} UTC+1
        </span>
      </div>

      {/* Feed items */}
      <div className="px-4 py-2 space-y-1.5 min-h-[140px]">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="flex items-start gap-2 animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="text-[8px] text-[#444444] font-[family-name:var(--font-space-mono)] shrink-0 pt-0.5">
              {item.timestamp}
            </span>
            {item.vertical && (
              <span className="text-[7px] text-[#555555] font-[family-name:var(--font-space-mono)] shrink-0 pt-0.5">
                {item.vertical}
              </span>
            )}
            <span
              className="text-[9px] leading-relaxed font-[family-name:var(--font-space-mono)]"
              style={{ color: typeColor(item.type) }}
            >
              {item.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
