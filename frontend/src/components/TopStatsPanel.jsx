import React from 'react';
import { AlertTriangle, Flame, Users, Car, Hash } from 'lucide-react';

export default function TopStatsPanel({ stats }) {
  const cards = [
    { label: 'Total Incidents', value: stats.total || 0, icon: Hash, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Fights Detected', value: stats['Fight'] || 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Fire & Smoke', value: stats['Fire/Smoke'] || 0, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Crowd Gathering', value: stats['Crowd'] || 0, icon: Users, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Red Light Violations', value: stats['Red Light Violation'] || 0, icon: Car, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const IconMatch = card.icon;
        return (
          <div key={idx} className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-xl flex items-center gap-4 relative overflow-hidden group">
            <div className={`p-3 rounded-lg ${card.bg}`}>
              <IconMatch className={card.color} size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">{card.label}</p>
              <p className="text-white text-2xl font-bold font-mono group-hover:scale-105 transition-transform origin-left">{card.value}</p>
            </div>
            {card.value > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>}
          </div>
        );
      })}
    </div>
  );
}
