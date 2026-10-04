'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  UserPlus, Shield, CheckCircle2, AlertCircle, LogOut, 
  ExternalLink, User, Search, ArrowRight, Sparkles 
} from 'lucide-react';
import { ROLES, REGISTRATION } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';

interface RobloxUser {
  username: string;
  userId: string;
  avatarUrl: string | null;
  profileUrl: string;
}

export default function KayitPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [gercekAd, setGercekAd] = useState('');
  const [robloxInput, setRobloxInput] = useState('');
  const [cinsiyet, setCinsiyet] = useState<'Erkek' | 'Kız'>('Erkek');

  // Roblox Live Verification State
  const [verifyingRoblox, setVerifyingRoblox] = useState(false);
  const [verifiedRoblox, setVerifiedRoblox] = useState<RobloxUser | null>(null);
  const [robloxError, setRobloxError] = useState<string | null>(null);

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.session) {
          setSession(data.session);
        } else {
          setSession(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setSession(null);
        setLoading(false);
      });
  }, []);

  const handleVerifyRoblox = async (inputVal: string) => {
    const val = inputVal.trim();
    if (!val) {
      setVerifiedRoblox(null);
      setRobloxError(null);
      return;
    }

    setVerifyingRoblox(true);
    setRobloxError(null);

    try {
      const res = await fetch(`/api/roblox/check?q=${encodeURIComponent(val)}`);
      const data = await res.json();

      if (res.ok && data.found && data.user) {
        setVerifiedRoblox(data.user);
        setRobloxError(null);
      } else {
        setVerifiedRoblox(null);
        setRobloxError('Roblox kullanıcısı bulunamadı. Lütfen tam kullanıcı adınızı veya linkinizi giriniz.');
      }
    } catch {
      setVerifiedRoblox(null);
      setRobloxError('Roblox bağlantısı kurulamadı.');
    } finally {
      setVerifyingRoblox(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/kayit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gercekAd,
          robloxLink: robloxInput,
          cinsiyet,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitSuccess(data.message);
        if (data.roblox) setVerifiedRoblox(data.roblox);
      } else {
        setSubmitError(data.error || 'Başvuru gönderilirken bir hata oluştu.');
      }
    } catch {
      setSubmitError('Sunucu ile bağlantı kurulamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mb-2" />
      </div>
    );
  }

  const isAlreadyRegistered = session?.roles?.includes(ROLES.WHITELIST) && !session?.roles?.includes(REGISTRATION.KAYITSIZ_ROL);

  return (
    <DashboardLayout session={session}>
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Piyade RP Kayıt Masası</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  @| Kayıtsız Üye
                </span>
              </div>
              <p className="text-xs text-gray-400">Roblox hesabınızı bağlayarak sunucumuza Whitelist başvurusunda bulunun</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/api/auth/logout"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış Yap</span>
            </Link>
          </div>
        </div>

      {/* Zaten Kayıtlı Uyarısı */}
      {isAlreadyRegistered && (
        <div className="glass-card p-6 rounded-3xl border-emerald-500/30 mb-8 bg-gradient-to-r from-emerald-950/20 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <h3 className="text-base font-bold text-white">Zaten Sunucumuzda Kayıtlısınız!</h3>
              <p className="text-xs text-gray-300">Hesabınızda aktif @| Whitelist rolü bulunmaktadır.</p>
            </div>
          </div>
          <Link
            href="/panel"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Oyuncu Paneline Git</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Başvuru Başarılı Ekranı */}
      {submitSuccess ? (
        <div className="glass-card p-8 rounded-3xl border-emerald-500/40 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Başvurunuz Başarıyla İletildi!</h2>
            <p className="text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
              {submitSuccess}
            </p>
          </div>

          {verifiedRoblox && (
            <div className="max-w-sm mx-auto p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-4 text-left">
              {verifiedRoblox.avatarUrl ? (
                <img
                  src={verifiedRoblox.avatarUrl}
                  alt={verifiedRoblox.username}
                  className="w-16 h-16 rounded-xl border border-white/10 object-cover bg-white/5"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  RB
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">DOĞRULANAN HESAP</span>
                <h4 className="text-base font-bold text-white">{verifiedRoblox.username}</h4>
                <p className="text-xs text-gray-400 font-mono">ID: {verifiedRoblox.userId}</p>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-400 max-w-lg mx-auto">
            ⏳ Whitelist yetkililerimiz Discord üzerinden onayladığı anda bot adınızı güncelleyecek ve Whitelist rolünüzü verecektir.
          </div>
        </div>
      ) : !session ? (
        /* Oturum Açılmamışsa */
        <div className="glass-card p-8 sm:p-12 rounded-3xl border-white/10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
            <UserPlus className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Discord ile Giriş Yapın</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              Piyade RP kayıt formunu doldurabilmek ve sunucumuza Whitelist başvurusunda bulunabilmek için lütfen öncelikle Discord hesabınız ile giriş yapınız.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/api/auth/discord"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
            >
              <span>Discord ile Giriş Yap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Kayıt Formu */
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-white/10 space-y-6">
          
          {/* Discord Oturum Bilgisi */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {session.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${session.id}/${session.avatar}.png?size=128`}
                  alt={session.username}
                  className="w-11 h-11 rounded-full border border-white/10"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-white text-sm">
                  {session.username?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="font-bold text-white text-sm">{session.username}</h4>
                <p className="text-[11px] text-gray-400 font-mono">Discord ID: {session.id}</p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              Bağlı ✅
            </span>
          </div>

          {submitError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-3 whitespace-pre-line">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Gerçek Ad */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                1. Gerçek Adınız Nedir? <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={gercekAd}
                onChange={(e) => setGercekAd(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                maxLength={50}
                required
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Sunucu içi isminiz <strong>"{gercekAd || 'GerçekAd'} | RobloxAdı"</strong> şeklinde ayarlanacaktır.
              </span>
            </div>

            {/* 2. Roblox Adı, ID veya Link */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                2. Roblox Adı, ID'si veya Profil Linki <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={robloxInput}
                  onChange={(e) => setRobloxInput(e.target.value)}
                  onBlur={() => handleVerifyRoblox(robloxInput)}
                  placeholder="Örn: Builderman, 156 veya https://www.roblox.com/users/..."
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleVerifyRoblox(robloxInput)}
                  disabled={verifyingRoblox || !robloxInput.trim()}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{verifyingRoblox ? 'Aranıyor...' : 'Doğrula'}</span>
                </button>
              </div>

              {robloxError && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{robloxError}</span>
                </p>
              )}

              {/* Canlı Doğrulanan Roblox Kartı */}
              {verifiedRoblox && (
                <div className="mt-3 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3.5">
                  {verifiedRoblox.avatarUrl ? (
                    <img
                      src={verifiedRoblox.avatarUrl}
                      alt={verifiedRoblox.username}
                      className="w-12 h-12 rounded-xl border border-emerald-500/30 object-cover bg-black/40"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                      RB
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{verifiedRoblox.username}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Doğrulandı ✅
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono">Roblox ID: {verifiedRoblox.userId}</p>
                  </div>
                  <a
                    href={verifiedRoblox.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-white p-2"
                    title="Roblox Profilini Aç"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* 3. Cinsiyet */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                3. Cinsiyetiniz Nedir? <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCinsiyet('Erkek')}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    cinsiyet === 'Erkek'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-600/20'
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span>👨 Erkek</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCinsiyet('Kız')}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    cinsiyet === 'Kız'
                      ? 'bg-pink-600/20 border-pink-500 text-pink-300 shadow-lg shadow-pink-600/20'
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span>👩 Kız</span>
                </button>
              </div>
            </div>

            {/* Bilgilendirme Kutusu */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-400 space-y-2">
              <div className="font-bold text-gray-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Kayıt & İsim Değiştirme Sistemi</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-400">
                <li>Başvurunuz Discord <strong>#kayıt-onay</strong> kanalına düşer.</li>
                <li>Yetkili onayladığında bot sunucudaki adınızı <strong>"{gercekAd || 'GerçekAd'} | {verifiedRoblox?.username || 'RobloxAdı'}"</strong> yapar.</li>
                <li>Kayıtsız rolünüz alınır, <strong>@| Whitelist</strong> ve <strong>@| Üye</strong> rolleriniz otomatik tanımlanır.</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Yetkililere İletiliyor...' : 'Kayıt Başvurusunu Tamamla & Bota Gönder'}</span>
            </button>
          </form>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
