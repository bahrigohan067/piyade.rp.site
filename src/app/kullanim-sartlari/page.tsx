'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, ShieldAlert, Award, AlertTriangle, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen bg-[#07080c] text-gray-200 flex flex-col justify-between selection:bg-blue-500/30 selection:text-blue-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Back button */}
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
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Topluluk & Hizmet Şartları</span>
              <h1 className="text-3xl sm:text-4xl font-black text-white">Kullanım Şartları</h1>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Son Güncelleme: 5 Ekim 2026 • Piyade Roleplay Web Portalı ve Roblox ER:LC Sunucu Sözleşmesi
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-gray-300">
          
          <section className="glass-card p-6 rounded-2xl border-white/5 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-400" />
              <span>1. Hizmetin Kabul Edilmesi</span>
            </h2>
            <p>
              Piyade Roleplay web sitesini ziyaret ederek, Discord hesabınızla oturum açarak veya oyun sunucumuza katılarak burada belirtilen tüm kullanım koşullarını, sunucu kurallarını ve ceza sistemini peşinen kabul etmiş sayılırsınız.
            </p>
          </section>

          <section className="glass-card p-6 rounded-2xl border-white/5 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>2. Rol Yapma Kuralları ve Ceza Sistemi</span>
            </h2>
            <p>
              Topluluğumuzda katı bir Hard RP anlayışı benimsenmiştir. Fail RP, VDM, RDM, Combat Log, Meta Gaming veya New Life Rule ihlallerinde sistem üzerinde yetkililer tarafından ceza puanı uygulanır:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-400 text-xs sm:text-sm">
              <li>Ceza puanı 3 puana ulaştığında 1. Kademe, 6 puanda 2. Kademe, 9 puanda 3. Kademe devreye girer.</li>
              <li>15 puana ulaşan kullanıcılar otomatik olarak sunucudan süresiz Jail (Hapis) cezası alır.</li>
              <li>Yetkililer kanıtsız keyfi ceza veremez; tüm uyarılar Discord log kanallarına kaydedilir.</li>
            </ul>
          </section>

          <section className="glass-card p-6 rounded-2xl border-white/5 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>3. Hesap Güvenliği ve Yetki Seviyeleri</span>
            </h2>
            <p>
              Kullanıcılar Discord ve Roblox hesaplarının güvenliğinden kendileri sorumludur. Başkasına ait kimlik veya Roblox adıyla kayıt açılması halinde başvuru süresiz reddedilir ve hesap yasaklanır.
            </p>
          </section>

          <section className="glass-card p-6 rounded-2xl border-white/5 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>4. Sözleşme Değişiklikleri</span>
            </h2>
            <p>
              Piyade Roleplay yönetimi ve Kurucu, oyun dengesini ve topluluk huzurunu korumak adına kurallarda ve şartlarda önceden bildirmeksizin güncelleme yapma hakkını saklı tutar.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
