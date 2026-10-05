'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Piyade Roleplay sunucusuna nasıl kayıt olabilirim?',
    answer: 'Ana sayfadaki "Discord ile Giriş Yap" butonuna tıklayarak hesabınızı bağlayın. Ardından Kayıt Masası üzerinden gerçek adınızı, Roblox kullanıcı adınızı veya profil linkinizi ve cinsiyetinizi girerek başvurunuzu iletebilirsiniz. Discord botumuz Roblox hesabınızı otomatik doğrulayarak yetkili onayına sunacaktır.',
  },
  {
    question: 'Roblox ER:LC sunucusuna bağlanmak için Whitelist zorunlu mu?',
    answer: 'Evet. Piyade RP, yüksek rol kalitesini korumak amacıyla Whitelist sistemini zorunlu kılmaktadır. Başvurunuz yetkili onayından geçtikten sonra Discord sunucumuzda adınız "Gerçek Ad | Roblox Ad" formatında güncellenir ve Whitelist rolünüz otomatik tanımlanır.',
  },
  {
    question: 'Ceza puanı sistemi nasıl çalışır ve Jail sınırı nedir?',
    answer: 'Rol kurallarını ihlal eden oyunculara yetkililer tarafından kural maddelerine göre 1 ile 5 arasında ceza puanı verilir. Toplam ceza puanı 15 puana ulaştığında sistem kullanıcıya otomatik olarak Kademe 5 (JAIL) cezası tanımlar. Ceza geçmişinizi Oyuncu Panelinizden dilediğiniz an inceleyebilirsiniz.',
  },
  {
    question: 'Sunucu durumu ne zaman "Rol Aktif" olur?',
    answer: 'Discord sunucumuzdaki rol oylaması botu, rol saati geldiğinde resmi duyuru kanalımıza "🚨 DİKKAT: ROL RESMEN BAŞLADI!" bildirimini geçtiği anda web sitemizdeki durum göstergesi otomatik olarak yeşile döner ve canlı oyuncu radarı aktif hale gelir.',
  },
  {
    question: 'Yetkili ekibine katılmak için ne yapmalıyım?',
    answer: 'Sunucumuzda belirli bir süre aktif rol yapmış, sicili temiz ve rol kurallarına tam hakim oyuncular dönem dönem açılan Staff / Yetkili başvuru dönemlerinde Discord sunucumuz üzerinden başvuru yapabilirler.',
  },
  {
    question: 'Discord oturumum neden otomatik açılıyor?',
    answer: 'Sitemiz Discord resmi OAuth2 protokolünü kullanır. Giriş yaptığınızda sunucumuzdaki rolleriniz (Kurucu, Yönetici, Staff veya Whitelist) okunarak yalnızca sizin yetkinizin yettiği paneller sol taraftaki menüde açılır. Şifreniz asla sitemizde tutulmaz.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="sss" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sıkça Sorulan Sorular</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white">
          Aklınıza Takılan Her Şey
        </h2>
        <p className="text-sm text-gray-400 max-w-xl mx-auto mt-2">
          Piyade Roleplay kayıt süreci, ER:LC sunucu bağlantısı ve yönetim kuralları hakkında en çok merak edilen sorular.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`glass-card rounded-2xl border transition-all duration-300 ${
                isOpen ? 'border-blue-500/40 bg-blue-950/10' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <button
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="w-full p-5 text-left flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isOpen ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-bold text-sm sm:text-base text-white">{faq.question}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
