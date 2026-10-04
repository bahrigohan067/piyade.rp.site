'use client';

import React, { useState } from 'react';
import { RULES } from '@/lib/constants';
import { Search, BookOpen, AlertOctagon, Scale, ShieldAlert } from 'lucide-react';

export default function RulesSection() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'genel' | 'duzen' | 'roleplay'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRules = RULES.filter((rule) => {
    const matchesCategory = activeCategory === 'all' || rule.category === activeCategory;
    const matchesQuery = 
      rule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rule.special && rule.special.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <section id="kurallar" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wider uppercase mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Resmi Ceza & Kural Listesi</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Sunucu & Roleplay <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Kuralları</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Roleplay kalitesini korumak için botumuz ve yetkili kadromuz tarafından uygulanan resmi maddeler.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 glass-card p-4 rounded-2xl">
          {/* Category Tabs (NO YETKİLİ KURALLARI) */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'all' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Tüm Maddeler ({RULES.length})
            </button>
            <button
              onClick={() => setActiveCategory('genel')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'genel' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-blue-400" />
              <span>1. Kategori: Genel (M1-M13)</span>
            </button>
            <button
              onClick={() => setActiveCategory('duzen')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'duzen' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>2. Kategori: Düzen (D1-D3)</span>
            </button>
            <button
              onClick={() => setActiveCategory('roleplay')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === 'roleplay' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              <span>3. Kategori: Roleplay (RM1-RM17)</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Madde veya kural ara..."
              className="w-full pl-10 pr-4 py-2 bg-[#090b12] border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRules.map((rule) => {
            const isHeavyPenalty = rule.points >= 5 || rule.special;
            return (
              <div 
                key={rule.id}
                className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between border-white/5 relative overflow-hidden group"
              >
                {/* Glow accent */}
                <div 
                  className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-15 pointer-events-none ${
                    isHeavyPenalty ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-blue-400 font-mono">
                        {rule.id}
                      </span>
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                        {rule.category === 'genel' && 'Genel Kurallar'}
                        {rule.category === 'duzen' && 'Sunucu Düzeni'}
                        {rule.category === 'roleplay' && 'Roleplay Kuralı'}
                      </span>
                    </div>

                    {rule.points > 0 ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        +{rule.points} Puan
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        {rule.special || "Özel Yaptırım"}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed font-normal">
                    {rule.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span>Otomatik Ceza Senkronu</span>
                  <span className="text-blue-400/80 group-hover:text-blue-300">Piyade Bot</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
