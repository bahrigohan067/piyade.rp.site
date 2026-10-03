export interface RuleItem {
  id: string;
  points: number;
  description: string;
  special?: string | null;
  category: 'genel' | 'duzen' | 'roleplay' | 'yetkili';
}

export const RULES: RuleItem[] = [
  // Genel Kurallar (M1 - M13)
  { id: "M1", points: 2, description: "Sunucumuzda küfür/hakarete başvurmak.", category: "genel" },
  { id: "M2", points: 0, description: "Reklam yapmak, hesap/oyun satışı gibi ticari faaliyetlerde bulunmak (Özel mesaj dahil).", special: "Doğrudan BAN", category: "genel" },
  { id: "M3", points: 1, description: "Etkinliklerde veya kapışmalarda karşı taraf rahatsız olduğu halde kendini abartı şekilde övmek.", category: "genel" },
  { id: "M4", points: 0, description: "Cinsiyet fark etmeksizin taciz içeren davranışlarda bulunmak.", special: "2 Gün Timeout", category: "genel" },
  { id: "M5", points: 3, description: "Kanalları amacı dışında kullanmak (Örn: #bot-komut kanalında sohbet etmek).", category: "genel" },
  { id: "M6", points: 8, description: "Cinsel içerikli herhangi bir paylaşım (görsel, yazı, link) yapmak.", category: "genel" },
  { id: "M7", points: 4, description: "Bir kişiye muhatap olmak istemediği sürece ya da kasten kavga ortamı yaratmak.", category: "genel" },
  { id: "M8", points: 5, description: "Zorbalık yapmak, başka bir üyeyi sunucudan soğutacak davranışlarda bulunmak.", category: "genel" },
  { id: "M9", points: 0, description: "Kurucu ve Üst Yönetim bilgisi dışında üyeleri başka sunucuya/gruba davet etmek.", special: "Yasaklı Rolü", category: "genel" },
  { id: "M10", points: 0, description: "+18, cinsel taciz, cinsiyet/yaş ayrımcılığı içeren içerik paylaşmak.", special: "1 Gün Timeout", category: "genel" },
  { id: "M11", points: 0, description: "Irkçılık ve her türlü ayrımcılık yapmak.", special: "1 Gün Timeout", category: "genel" },
  { id: "M12", points: 2, description: "Üyelerin psikolojisini etkileyecek argo, küçümseme ve dalga geçme gibi davranışlar.", category: "genel" },
  { id: "M13", points: 0, description: "Etkinlik ve kapışmalarda 3. Taraf yazılım (hile/makro) kullanmak.", special: "1 Gün Timeout", category: "genel" },

  // Sunucu Düzeni (D1 - D3)
  { id: "D1", points: 3, description: "Önemli kanallara (duyuru vb.) anlamsız, boş mesajlar göndermek.", category: "duzen" },
  { id: "D2", points: 3, description: "Ses kanallarında paneli veya sohbet kanallarında sohbeti gereksiz çağırmak.", category: "duzen" },
  { id: "D3", points: 3, description: "Önemli ses kanallarında sürekli yolculuk yaparak gereksiz bildirim yağmuruna sebep olmak.", category: "duzen" },

  // Roleplay (RM) Kuralları (RM1 - RM17)
  { id: "RM1", points: 3, description: "Fail RP (FRP) - Rol kurallarını ve mantığını bozmak.", category: "roleplay" },
  { id: "RM2", points: 3, description: "Fear Roleplay - Hayat korkusu / Korku rolü yapmama.", category: "roleplay" },
  { id: "RM3", points: 2, description: "Cop Trigger (Cop-Bait) - Polisi sebepsiz kışkırtma.", category: "roleplay" },
  { id: "RM4", points: 4, description: "New Life Rule (NLR) İhlali - Öldükten sonra eski olayı hatırlama.", category: "roleplay" },
  { id: "RM5", points: 2, description: "Non-RP Driving - Gerçekçi olmayan araç kullanımı.", category: "roleplay" },
  { id: "RM6", points: 3, description: "Combat LOG (CL) - Çatışma/Rol anında oyundan çıkmak.", category: "roleplay" },
  { id: "RM7", points: 4, description: "Meta Gaming (MG) - Oyun dışı bilgiyi oyun içinde kullanmak.", category: "roleplay" },
  { id: "RM8", points: 3, description: "Power Gaming (PG) - Gerçekte yapılamayacak hareketleri rolde dayatmak.", category: "roleplay" },
  { id: "RM9", points: 0, description: "Erotik Roleplay (ERP) Dayatması veya İhlali.", special: "4 Gün Timeout", category: "roleplay" },
  { id: "RM10", points: 4, description: "Random Shooting - Sebepsizce etrafa ateş açmak.", category: "roleplay" },
  { id: "RM11", points: 3, description: "Vehicle Death Match (VDM) - Araçla sebepsiz oyuncu ezmek/öldürmek.", category: "roleplay" },
  { id: "RM12", points: 2, description: "GOOA - Silah çekme kuralı ihlali.", category: "roleplay" },
  { id: "RM13", points: 4, description: "Trash Talk (TT) - Roleplay içerisinde haddini aşan toksik konuşmalar.", category: "roleplay" },
  { id: "RM14", points: 3, description: "Random Death Match (RDM) - Geçerli rol gerekçesi olmadan adam öldürmek.", category: "roleplay" },
  { id: "RM15", points: 1, description: "Kaza RP Yapmama - Araç kazası sonrası hasar/yaralanma rolü yapmamak.", category: "roleplay" },
  { id: "RM16", points: 2, description: "Refuse RP - Başlatılan meşru rolü sebepsiz reddetmek.", category: "roleplay" },
  { id: "RM17", points: 5, description: "Abuse - Oyun ve harita açıklarını suistimal etmek.", category: "roleplay" },

  // Yetkili Kuralları (Y1 - Y5)
  { id: "Y1", points: 0, description: "Yetkisini kendi veya yakını lehine kullanmak.", special: "Yetki Alımı", category: "yetkili" },
  { id: "Y2", points: 0, description: "Sunucudaki katılımcıyı kasten yanlış yönlendirmek.", special: "Yetkili Uyarısı", category: "yetkili" },
  { id: "Y3", points: 0, description: "Yanlış işlem yapmak (Örn: Hatalı ceza/uyarı kesmek).", special: "Yetkili Uyarısı", category: "yetkili" },
  { id: "Y4", points: 0, description: "Sunucuda kendini diğer üyelerden üstün görmek ve kibirli davranmak.", special: "Yetkili Uyarısı", category: "yetkili" },
  { id: "Y5", points: 0, description: "Kendinden üst kademeli yetkililerin talimatlarını dinlememek/ihlal etmek.", special: "Yetkili Uyarısı", category: "yetkili" },
];

export const WARNING_TIERS = [
  { tier: 1, minPoints: 3, roleName: "Uyarı 1", color: "#F59E0B" },
  { tier: 2, minPoints: 6, roleName: "Uyarı 2", color: "#F97316" },
  { tier: 3, minPoints: 9, roleName: "Uyarı 3", color: "#EF4444" },
  { tier: 4, minPoints: 12, roleName: "Uyarı 4", color: "#DC2626" },
  { tier: 5, minPoints: 15, roleName: "Uyarı 5 (JAIL)", color: "#7F1D1D" },
];

export const SAFEZONES = [
  { id: "gun_shop", name: "Gunshop Etkileşimli Bölge", postal: "227", type: "Safezone & Market" },
  { id: "police_department", name: "Polis Departmanı", postal: "310, 316, 317", type: "Korumalı Safezone" },
  { id: "fire_department", name: "İtfaiye Departmanı", postal: "228, 229", type: "Korumalı Safezone" },
  { id: "city_spawn", name: "City Spawn", postal: "210, 211", type: "Doğma Noktası Safezone" },
];
