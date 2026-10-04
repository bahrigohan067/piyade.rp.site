import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Lock, Key, Users, AlertTriangle, Terminal, Sparkles } from 'lucide-react';
import { ROLES } from '@/lib/constants';

export default function SelectRolePage() {
  const roleCards = [
    {
      roleKey: 'kurucu',
      title: '@|👤 KURUCU',
      roleId: ROLES.KURUCU,
      badge: 'Tam Yetkili + Özel Kurucu Terminali',
      color: 'from-purple-600 to-indigo-600',
      borderColor: 'border-purple-500/30',
      desc: 'Sistemdeki her şeyi görür. SADECE bu role sahip kişi üyelerin hangi Discord sunucularında olduğunu görür! Tüm üyelerin uyarı, timeout ve banlarını denetler.',
      target: '/kurucu',
      icon: Terminal,
    },
    {
      roleKey: 'ust_yonetim',
      title: '@|👤 Üst Yönetim',
      roleId: ROLES.UST_YONETIM,
      badge: 'Yönetim Masası',
      color: 'from-red-600 to-orange-600',
      borderColor: 'border-red-500/30',
      desc: 'Her üyenin işlemini, konumunu, panel yönetimini gerçekleştirir. Her üyenin uyarısını, timeoutunu ve banını görür.',
      target: '/yetkili',
      icon: Shield,
    },
    {
      roleKey: 'yonetici',
      title: '@|💎 Yönetici',
      roleId: ROLES.YONETICI,
      badge: 'Yönetici Masası',
      color: 'from-blue-600 to-cyan-600',
      borderColor: 'border-blue-500/30',
      desc: 'Tüm üye işlemlerini ve konumlarını görebilir. Her üyenin uyarısını, timeoutunu ve banını denetler.',
      target: '/yetkili',
      icon: Shield,
    },
    {
      roleKey: 'senior_staff',
      title: '@| Senior Staff',
      roleId: ROLES.SENIOR_STAFF,
      badge: 'Kıdemli Yetkili (Uyarı Verme Aktif)',
      color: 'from-amber-600 to-yellow-600',
      borderColor: 'border-amber-500/30',
      desc: 'Tüm üyelerin sicilini, timeoutunu, banını görür ve doğrudan resmi kural maddeleriyle veya sözlü uyarı verebilir.',
      target: '/yetkili',
      icon: AlertTriangle,
    },
    {
      roleKey: 'staff',
      title: '@| Staff',
      roleId: ROLES.STAFF,
      badge: 'Yetkili (Uyarı Verme Aktif)',
      color: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-500/30',
      desc: 'Tüm üyelerin sicilini, timeoutunu, banını görür ve doğrudan uyarı verme fonksiyonunu kullanabilir.',
      target: '/yetkili',
      icon: AlertTriangle,
    },
    {
      roleKey: 'trial_staff',
      title: '@| Trial Staff',
      roleId: ROLES.TRIAL_STAFF,
      badge: 'Stajyer Yetkili (Salt Okuma)',
      color: 'from-gray-600 to-gray-700',
      borderColor: 'border-gray-500/30',
      desc: 'Her üyenin uyarısını, timeoutunu ve banını görür. FAKAT UYARI VEREMEZ! (Uyarı verme paneli kilitlidir).',
      target: '/yetkili',
      icon: Lock,
    },
    {
      roleKey: 'illegal',
      title: '@| Whitelist + @| İllegal',
      roleId: `${ROLES.WHITELIST} & ${ROLES.ILLEGAL}`,
      badge: 'Oyuncu + Çete Başvuru Menüsü Açık',
      color: 'from-indigo-600 to-purple-800',
      borderColor: 'border-indigo-500/30',
      desc: 'Kendi uyarısını ve rollerini görür. İllegal rolüne sahip olduğu için çete kurma, başvuru ve parsel menüsü açıktır!',
      target: '/panel',
      icon: Users,
    },
    {
      roleKey: 'whitelist',
      title: '@| Whitelist (Sivil/Polis Üye)',
      roleId: ROLES.WHITELIST,
      badge: 'Standart Oyuncu Paneli',
      color: 'from-emerald-600 to-teal-600',
      borderColor: 'border-emerald-500/30',
      desc: 'Sunucu durumunu, SADECE kendi uyarısını ve kendi rollerini görür. İllegal rolü olmadığı için çete kısmı tamamen gizlidir.',
      target: '/panel',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top Notice */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-blue-500/30 text-blue-400 text-xs font-bold tracking-wider uppercase mb-4">
          <Key className="w-3.5 h-3.5" />
          <span>Yetki ve Rol Seçim Terminali</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Piyade RP <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Rol Seviyesi</span> Seçin
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Discord OAuth2 girişiniz yapıldığında yetkiniz Discord sunucumuzdaki rollerinize göre otomatik algılanır. Test etmek istediğiniz yetki seviyesini seçerek ilgili sayfaya anında geçiş yapabilirsiniz.
        </p>
      </div>

      {/* Grid of Role Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        {roleCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Link
              key={card.roleKey}
              href={`/api/auth/simulate?role=${card.roleKey}`}
              className={`glass-card glass-card-hover p-6 rounded-3xl border ${card.borderColor} flex flex-col justify-between group relative overflow-hidden`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base group-hover:text-blue-400 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-[11px] font-mono text-gray-500">ID: {card.roleId}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                    {card.badge}
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mt-2">
                  {card.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Hedef Sayfa: <code className="text-gray-300">{card.target}</code></span>
                <span className="text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Bu Rolle Giriş Yap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="text-center">
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Ana Sayfaya Geri Dön
        </Link>
      </div>
    </div>
  );
}
