'use client';

import React, { useState } from 'react';
import { RP_TERIMLERI } from '@/lib/constants';
import { FileText, Search, BookMarked } from 'lucide-react';

export default function TermsSection() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = RP_TERIMLERI.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.shortName && t.shortName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="terimler" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-wider uppercase mb-4">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Roleplay Kültürü & Sözlüğü</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Temel <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">RP Terimleri</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Sunucumuzda rol kalitesini en üst düzeyde tutmak amacıyla her oyuncunun bilmesi zorunlu olan temel kavramlar.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Terim ara (Örn: RDM, NLR, FRP, Cop-Bait)..."
              className="w-full pl-10 pr-4 py-3 bg-[#090b12] border border-white/10 rounded-2xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors shadow-lg"
            />
          </div>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTerms.map((term, index) => (
            <div 
              key={index}
              className="glass-card glass-card-hover p-6 rounded-2xl border-white/5 relative overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="font-extrabold text-white text-base group-hover:text-purple-400 transition-colors">
                    {term.name}
                  </h4>
                  {term.shortName && (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {term.shortName}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                  {term.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                <span>Resmi Kural Rehberi</span>
                <span className="text-purple-400/80">Piyade RP</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
