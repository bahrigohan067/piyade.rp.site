// ==========================================
// PİYADE ROLEPLAY - RESMİ SABİTLER VE ROLLER
// ==========================================

export const DISCORD_INVITE_URL = "https://discord.gg/9QGAZB54Br";
export const GUILD_ID = "1529545898294509589";

// Rol ID'leri (Kullanıcının Verdiği Kesin Tanımlar)
export const ROLES = {
  KURUCU: "1529546007635824680",         // Sistemdeki her şeyi görür + Hangi sunucularda olduklarını SADECE bu görür
  UST_YONETIM: "1539167256246747186",    // Tüm üye işlemlerini, konumu ve panel yönetimini yapar + Uyarı/Timeout/Ban görür
  YONETICI: "1534798061845483694",       // Üye işlemi + konum görür + Uyarı/Timeout/Ban görür
  SENIOR_STAFF: "1551241753137254611",   // Uyarı verebilir + Uyarı/Timeout/Ban görür
  STAFF: "1551241634094645288",          // Uyarı verebilir + Uyarı/Timeout/Ban görür
  TRIAL_STAFF: "1551241468985737376",    // Uyarı/Timeout/Ban görür FAKAT UYARI VEREMEZ!
  WHITELIST: "1533908873772273715",      // Normal oyuncu (Kendi sicilini, rollerini, sunucu durumunu görür)
  ILLEGAL: "1539249508314259567",        // Çete menüsü ve başvurusu SADECE bu role açıktır
};

// Uyarı ve Ceza Rolleri
export const PUNISHMENT_ROLES = {
  UYARI_1: "1534715251323572315",  // 3+ puan
  UYARI_2: "1534715383507058749",  // 6+ puan
  UYARI_3: "1534715488716853278",  // 9+ puan
  UYARI_4: "1553054768388374620",  // 12+ puan
  UYARI_5: "1553055210073497710",  // 15+ puan
  JAIL: "1553053929087172768",     // Jail cezası
  YASAKLI: "1534715583826759790",  // M9 Özel ceza
};

// Kanal ID'leri
export const CHANNELS = {
  UYARILAR: "1532828434739368149",
  SICIL_LOG: "1532828404347437287",
  DUYURU: "1554103929451581460",
};

// ==========================================
// ROLEPLAY TERİMLERİ VE KAVRAMLAR
// ==========================================
export interface TermItem {
  name: string;
  shortName?: string;
  description: string;
}

export const RP_TERIMLERI: TermItem[] = [
  {
    name: "Roleplay Nedir?",
    description: "Yaratılan sanal bir karakterin geçmişini, duygularını, mesleğini ve kişiliğini gerçek hayat kurallarına ve mantığına sadık kalarak oyun dünyasında yansıtmaktır."
  },
  {
    name: "Out Of Character",
    shortName: "OOC",
    description: "Oyun dünyasının ve rolün tamamen dışında kalan, gerçek hayatı ve oyuncunun kendisini (oyun dışı) ifade eden kavramdır."
  },
  {
    name: "In Character",
    shortName: "IC",
    description: "Tamamen rolün içinde olmayı ve yaratılan kurgusal karakterin oyun içi perspektifini ve bilincini temsil eder."
  },
  {
    name: "Fail RP",
    shortName: "FRP",
    description: "Rolün doğal akışını zedeleyen, gerçek dünyada yapılması mantıksız ve imkansız olan absürt hareketler sergilemektir."
  },
  {
    name: "Fear Roleplay",
    shortName: "Fear RP",
    description: "Karakterin can güvenliğinin tehlikede olduğu anlarda, duruma uygun ve gerçekçi bir biçimde korku hissini role aktarmasıdır."
  },
  {
    name: "Cop Trigger",
    shortName: "Cop-Bait",
    description: "Herhangi bir geçerli neden yokken polis memurlarını tahrik etmek veya bilerek suçlu profili çizip sadece dikkat çekmeye çalışmaktır."
  },
  {
    name: "New Life Rule",
    shortName: "NLR",
    description: "Karakterin rol gereği bilincini kaybetmesi (bayılması veya ağır yaralanması) durumunda, ayıldıktan sonra o olaya dair tüm detayları oyun içi (IC) hafızasından tamamen silmesi kuralıdır."
  },
  {
    name: "Non-RP Driving",
    description: "Araç kullanımı esnasında fizik kurallarını hiçe sayan, gerçek dışı ve abartılı bir sürüş tarzı benimsemektir."
  },
  {
    name: "Combat LOG",
    shortName: "CL",
    description: "Devam eden aktif bir rolün ortasındayken bağlantıyı kesmek, oyundan çıkmak veya izin almadan yeniden bağlanıp kaçmaktır."
  },
  {
    name: "Meta Gaming",
    shortName: "MG",
    description: "Karakterin oyun içinde bilmesinin imkansız olduğu, dış kaynaklardan (Discord, yayınlar vb.) öğrenilen gerçek hayat (OOC) bilgilerini oyun içi (IC) eylemlere dahil etmektir."
  },
  {
    name: "Power Gaming",
    shortName: "PG",
    description: "Karakteri gerçek bir insandan beklenmeyecek düzeyde doğaüstü, kusursuz veya yenilmez göstermek; insanüstü güç gerektiren eylemleri normalmiş gibi yapmaktır."
  },
  {
    name: "Erotik Roleplay",
    shortName: "ERP",
    description: "Rolün gidişatında cinsel eylemlerin, imaların veya bu tarz detaylı betimlemelerin yer aldığı etkileşimlerdir."
  },
  {
    name: "Random Shooting",
    description: "Geçerli bir çatışma veya rol sebebi bulunmadan, çevreye sebepsiz ve rastgele ateş açmaktır."
  },
  {
    name: "Vehicle Death Match",
    shortName: "VDM",
    description: "Aracı kasıtlı olarak bir silah ve saldırı aleti gibi kullanarak, geçerli bir neden olmadan diğer oyuncuları ezmek veya onlara hasar vermektir."
  },
  {
    name: "GOOA",
    description: "Büyük boyutlu ve uzun namlulu silahları aniden ortaya çıkarmak yerine, öncesinde bunu eylem (emote) ile belirtmek veya sırtta/çantada taşındığını gösterecek bir donanıma sahip olma zorunluluğudur."
  },
  {
    name: "Trash Talk",
    shortName: "TT",
    description: "Rol gidişatında hiçbir temeli ve mantıklı sebebi yokken ortamı germek, boş yere küfretmek ve sözlü sataşmalarda bulunmaktır."
  },
  {
    name: "Random Death Match",
    shortName: "RDM",
    description: "Rolsel bir geçmişi veya mantıklı bir husumeti olmadan, sırf zevk için başka bir karakterin canına kast etmek ve öldürmektir."
  },
  {
    name: "Kaza RP",
    description: "Araçla kaza yapıldığında, hiçbir şey olmamış gibi yola devam etmek yerine kazaya karışan tüm tarafların çarpışmanın şiddetine uygun yaralanma rolü yapması zorunluluğudur."
  },
  {
    name: "Refuse RP",
    description: "Oyuna uygun şekilde başlatılmak istenen bir rol etkileşiminden kasıtlı olarak kaçınmak veya karşı tarafın paslarını cevapsız bırakıp rolü reddetmektir."
  },
  {
    name: "Abuse",
    description: "Oyunun tasarımsal açıklarını, yazılım hatalarını veya mekaniklerini suistimal ederek diğer oyunculara karşı haksız bir üstünlük kurmaktır."
  }
];

// ==========================================
// RESMİ KURAL LİSTESİ (SADECE OYUNCUYA AÇIK OLANLAR)
// ==========================================
export interface RuleItem {
  id: string;
  points: number;
  description: string;
  special?: string | null;
  category: 'genel' | 'duzen' | 'roleplay';
}

export const RULES: RuleItem[] = [
  // 1. KATEGORİ: GENEL KURALLAR (M1 - M13)
  { id: "M1", points: 2, description: "Sunucumuzda küfür/hakarete başvurmak.", category: "genel" },
  { id: "M2", points: 0, description: "Reklam yapmak, hesap/oyun satışı gibi ticari faaliyetlerde bulunmak (Özel mesajda dahil).", special: "Kalıcı Yasak (Permanent Ban)", category: "genel" },
  { id: "M3", points: 1, description: "Sunucumuzda düzenlenen etkinliklerde veya yapılacak olan kapışmalarda karşı taraf rahatsız olduğu halde kendini abartı şekilde övmek.", category: "genel" },
  { id: "M4", points: 0, description: "Cinsiyet fark etmeksizin taciz içeren davranışlarda bulunmak.", special: "2 Gün Timeout", category: "genel" },
  { id: "M5", points: 3, description: "Kanalları amacı dışında kullanmak (Örn: #bot-komut'da sohbet etmek).", category: "genel" },
  { id: "M6", points: 8, description: "Cinsel içerikli herhangi bir paylaşım (görsel, yazı, link) yapmak.", category: "genel" },
  { id: "M7", points: 4, description: "Bir kişiye muhattap olmak istemediği sürece ya da kasten kavga ortamı yaratmak.", category: "genel" },
  { id: "M8", points: 5, description: "Zorbalık yapmak, başka bir üyeyi sunucudan soğutacak davranışlarda bulunmak.", category: "genel" },
  { id: "M9", points: 0, description: "Kurucu ve Üst Yönetim bilgisi dışında sunucu üyelerini kendi sunucunuza veya grubunuza davet etmek.", special: "Doğrudan Yasaklı Rolü", category: "genel" },
  { id: "M10", points: 0, description: "+18, cinsel taciz, ırkçılık, cinsiyet/yaş ayrımcılığı içeren içerik paylaşmak.", special: "1 Gün Timeout", category: "genel" },
  { id: "M11", points: 0, description: "Irkçılık ve her türlü ayrımcılık yapmak.", special: "1 Gün Timeout", category: "genel" },
  { id: "M12", points: 2, description: "Sunucuda bulunan kişilerin psikolojisini etkileyecek argo, küçümseme ve dalga geçme gibi faaliyetler yapmak.", category: "genel" },
  { id: "M13", points: 0, description: "Sunucuda yapılan etkinliklerde ve kapışmalarda 3. Taraf yazılım kullanmak.", special: "1 Gün Timeout", category: "genel" },

  // 2. KATEGORİ: GENEL SUNUCU DÜZENİ (D1 - D3)
  { id: "D1", points: 3, description: "Önemli kanallara (duyuru vb.) anlamsız, boş mesajlar atmak.", category: "duzen" },
  { id: "D2", points: 3, description: "Ses kanallarında ses panelini veya sohbet kanallarında sohbeti gereksiz yere çağırmak (spawnlamak).", category: "duzen" },
  { id: "D3", points: 3, description: "Önemli ses kanallarında sürekli yolculuk yaparak gereksiz bildirim yağmuruna sebep olmak.", category: "duzen" },

  // 3. KATEGORİ: ROLEPLAY (RM) KURALLARI (RM1 - RM17)
  { id: "RM1", points: 3, description: "Fail RP (FRP)", category: "roleplay" },
  { id: "RM2", points: 3, description: "Fear Roleplay (Korku Rolü Yapmama)", category: "roleplay" },
  { id: "RM3", points: 2, description: "Cop Trigger (Cop-Bait)", category: "roleplay" },
  { id: "RM4", points: 4, description: "New Life Rule (NLR) İhlali", category: "roleplay" },
  { id: "RM5", points: 2, description: "Non-RP Driving", category: "roleplay" },
  { id: "RM6", points: 3, description: "Combat LOG (CL)", category: "roleplay" },
  { id: "RM7", points: 4, description: "Meta Gaming (MG)", category: "roleplay" },
  { id: "RM8", points: 3, description: "Power Gaming (PG)", category: "roleplay" },
  { id: "RM9", points: 0, description: "Erotik Roleplay (ERP) Dayatması/İhlali", special: "4 Gün Timeout", category: "roleplay" },
  { id: "RM10", points: 4, description: "Random Shooting", category: "roleplay" },
  { id: "RM11", points: 3, description: "Vehicle Death Match (VDM)", category: "roleplay" },
  { id: "RM12", points: 2, description: "GOOA (Silah Çıkarma Kuralı İhlali)", category: "roleplay" },
  { id: "RM13", points: 4, description: "Trash Talk (TT)", category: "roleplay" },
  { id: "RM14", points: 3, description: "Random Death Match (RDM)", category: "roleplay" },
  { id: "RM15", points: 1, description: "Kaza RP Yapmama", category: "roleplay" },
  { id: "RM16", points: 2, description: "Refuse RP (Rolü Reddetmek)", category: "roleplay" },
  { id: "RM17", points: 5, description: "Abuse (Oyun Açığı Suistimali)", category: "roleplay" },
];

export const VALID_PARSELLER = [
  "700", "701", "702", "703", "1104", "1108", "1101", 
  "601", "602", "600", "805", "807", "809", 
  "1003", "1004", "1005", "1006", "1007", "1008", "1009", 
  "403", "404", "405", "406", "407", "409", "410", "411"
];


export const SAFEZONES = [
  { id: "gun_shop", name: "Gunshop Etkileşimli Bölge", postal: "227", type: "Safezone & Market" },
  { id: "police_department", name: "Polis Departmanı", postal: "310, 316, 317", type: "Korumalı Safezone" },
  { id: "fire_department", name: "İtfaiye Departmanı", postal: "228, 229", type: "Korumalı Safezone" },
  { id: "city_spawn", name: "City Spawn", postal: "210, 211", type: "Doğma Noktası Safezone" },
];
