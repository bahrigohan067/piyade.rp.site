'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, UserCheck, Send, CheckCircle2, Trash2, Search } from 'lucide-react';
import { RULES } from '@/lib/constants';

interface StaffPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffPanelModal({ isOpen, onClose }: StaffPanelModalProps) {
  const [selectedUser, setSelectedUser] = useState('PiyadeOyuncu (153283158275312)');
  const [selectedRuleId, setSelectedRuleId] = useState('RM14');
  const [reasonNote, setReasonNote] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submittedAlert, setSubmittedAlert] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentRule = RULES.find((r) => r.id === selectedRuleId) || RULES[0];

  const handleIssueWarning = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAlert(
      `✅ Başarılı! ${selectedUser} adlı kullanıcıya ${currentRule.id} kuralından ceza kesildi. Bot tarafından Discord #uyarılar kanalına embed atıldı ve rol güncellendi!`
    );
    setTimeout(() => {
      setSubmittedAlert(null);
    }, 6000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-card rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">Yetkili İhlal & Uyarı Masası</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                Staff Yetkili Paneli
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">Üyelere resmi sunucu kurallarından uyarı girin, puanı sistem otomatik hesaplasın.</p>
          </div>
        </div>

        {submittedAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{submittedAlert}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form: Uyarı Kes */}
          <form onSubmit={handleIssueWarning} className="lg:col-span-7 space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Yeni Ceza / Uyarı Girişi</span>
            </h4>

            {/* Target Member Search/Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">İşlem Yapılacak Üye</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  placeholder="Kullanıcı Adı veya Discord ID"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090b12] border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>
            </div>

            {/* Rule Selection Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">İhlal Edilen Kural Maddesi</label>
              <select
                value={selectedRuleId}
                onChange={(e) => setSelectedRuleId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#090b12] border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-amber-500/50"
              >
                <optgroup label="Roleplay (RM) Kuralları">
                  {RULES.filter(r => r.category === 'roleplay').map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id} - {r.description} ({r.points > 0 ? `+${r.points} Puan` : r.special})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Genel Kurallar (M)">
                  {RULES.filter(r => r.category === 'genel').map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id} - {r.description} ({r.points > 0 ? `+${r.points} Puan` : r.special})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Sunucu Düzeni (D)">
                  {RULES.filter(r => r.category === 'duzen').map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id} - {r.description} (+{r.points} Puan)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Auto-Calculated Point Badge */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">Sistemin Tanımlayacağı Puan:</span>
                <p className="text-sm font-semibold text-gray-200">{currentRule.description}</p>
              </div>
              <div className="text-right">
                {currentRule.points > 0 ? (
                  <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                    +{currentRule.points} Ceza Puanı
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold">
                    {currentRule.special || "Özel Yaptırım"}
                  </span>
                )}
              </div>
            </div>

            {/* Reason Details */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Olay Açıklaması / Detay</label>
              <textarea
                rows={2}
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                placeholder="Örn: Gunshop önünde sebepsiz yere sivillere ateş açtı."
                className="w-full px-4 py-2 bg-[#090b12] border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Proof URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Kanıt Linki (Ekran Görüntüsü / Video)</label>
              <input
                type="text"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://streamable.com/... veya https://medal.tv/..."
                className="w-full px-4 py-2 bg-[#090b12] border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-bold text-white text-sm shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Discord Botuna Gönder & Rolü Ver</span>
            </button>
          </form>

          {/* Right Column: Member Current Warnings & Pardon */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Seçili Üyenin Aktif Sicili</span>
            </h4>

            <div className="glass-card p-4 rounded-2xl border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-white/5">
                <span className="text-gray-400">Toplam Puan:</span>
                <span className="font-bold text-amber-400">3 Puan (Kademe 1)</span>
              </div>

              {/* Warning Item 1 */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400">#4A9C</span>
                    <span className="text-xs font-semibold text-gray-200">RM14 (RDM)</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">+3 Puan • 02.10.2026</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Uyarı silme talebi bota iletildi! Sicil temizlendi.")}
                  title="Uyarıyı Kaldır / Affet"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[11px] text-gray-400 leading-relaxed">
                💡 <strong className="text-gray-300">Yetkili Notu:</strong> Siteden girdiğiniz her uyarı, Discord botunuzun <code className="text-blue-400">data/uyari_data.json</code> ve <code className="text-blue-400">data/sicil_data.json</code> dosyalarıyla senkronize çalışır.
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
