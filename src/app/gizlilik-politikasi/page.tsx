'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Lock, Database, Eye, Server, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-gray-200 flex flex-col justify-between selection:bg-blue-500/30 selection:text-blue-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Breadcrumb / Back button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Yasal & KVKK Uyum Bildirimi</span>
              <h1 className="text-3xl sm:text-4xl font-black text-white">Gizlilik Politikası</h1>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Son Güncelleme: 5 Ekim 2026 • Piyade Roleplay Web Portalı ve Discord Entegrasyon Hizmetleri
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-gray-300">
          
          <section className="glass-card p-6 rounded-2xl border-white/5 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              <span>1. Toplanan Veriler ve Kapsam</span>
            </h2>
            <p>
              Piyade Roleplay web sitesi ve Discord botu, kullanıcılara güvenli bir oyun ve yönetim ortamı sunmak amacıyla sınırlı kişisel ve platform verilerini işler:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-400 text-xs sm:text-sm">
              <li><strong>Discord Kimlik Bilgileri:</strong> Discord ID, kullanıcı adı, avatar ve sunucu içi roller (OAuth2 aracılığıyla).</li>
              <li><strong>Roblox Oyun Bilgileri:</strong> Roblox kullanıcı adı, oyuncu ID ve Emergency Response: Liberty County oyun içi senkronizasyon verileri.</li>
              <li><strong>Sicil ve Kural İhlal Kayıtları:</strong> Sunucu yetkilileri tarafından verilen uyarılar, ceza puanları ve sözlü bildirimler.</li>
              <li><strong>Oturum Çerezleri:</strong> Sisteme güvenli giriş yapabilmeniz amacıyla 4 KB sınırını aşmayan şifreli oturum çerezi (<code className="text-blue-300">piyade_session</code>).</li>
            </ul>
          </section>

          <section className="glass-card p-6 rounded-2xl border-white/5 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              <span>2. Verilerin Kullanım Amacı</span>
            </h2>
            <p>Toplanan veriler yalnızca aşağıdaki amaçlar doğrultusunda işlenir:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-400 text-xs sm:text-sm">
              <li>Kullanıcı rollerine göre yetkilendirme (Whitelist, Yetkili, Kurucu ve Kayıtsız üye ayrımı).</li>
              <li>Kayıt başvurularının Discord onay kanalına iletilmesi ve Roblox hesap doğrulaması.</li>
              <li>Oyun içi düzenin korunması ve kural ihlallerinin adil şekilde cezalandırılması.</li>
              <li>Canlı ER:LC sunucu doluluk ve rol durumu bildirimlerinin anlık aktarımı.</li>
            </ul>
          </section>

          <section className="glass-card p-6 rounded-2xl border-white/5 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              <span>3. Çerezler ve Oturum Güvenliği</span>
            </h2>
            <p>
              Web sitemizde üçüncü taraf reklam veya takip çerezleri kesinlikle kullanılmaz. Sadece oturumunuzu açık tutmak için <code className="text-purple-300">HttpOnly</code>, <code className="text-purple-300">SameSite=Lax</code> ve <code className="text-purple-300">Secure</code> standartlarında fonksiyonel birinci taraf çerezler barındırılır.
            </p>
          </section>

          <section className="glass-card p-6 rounded-2xl border-white/5 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-amber-400" />
              <span>4. Veri Güvenliği ve Saklama Süresi</span>
            </h2>
            <p>
              Verileriniz doğrudan Discord API ve sunucu bot veritabanında güvenli protokollerle barındırılır. Sunucudan ayrılan veya kaydı silinen kullanıcıların verileri sistem kurallarına uygun olarak arşivlenir veya silinir.
            </p>
          </section>

          <section className="glass-card p-6 rounded-2xl border-white/5 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <span>5. Kullanıcı Hakları ve İletişim</span>
            </h2>
            <p>
              Kişisel verilerinizin silinmesini, güncellenmesini veya düzeltilmesini talep etmek için resmi{' '}
              <a
                href="https://discord.gg/9QGAZB54Br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline hover:text-blue-300"
              >
                Piyade RP Discord Destek Kanalı
              </a>{' '}
              üzerinden Kurucu ve Üst Yönetim ile iletişime geçebilirsiniz.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
