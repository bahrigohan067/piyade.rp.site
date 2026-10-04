export interface RobloxUserInfo {
  username: string;
  userId: string;
  avatarUrl: string | null;
  profileUrl: string;
}

export async function findRobloxUser(input: string): Promise<RobloxUserInfo | null> {
  const query = input.trim();
  if (!query) return null;

  let userId: string | null = null;
  let username: string | null = null;

  // 1. Profil URL'si mi kontrol et (Örn: https://www.roblox.com/users/123456/profile)
  const urlMatch = query.match(/\/users\/(\d+)/i);
  if (urlMatch) {
    userId = urlMatch[1];
  } else if (/^\d+$/.test(query)) {
    // Sadece sayısal ID girilmişse
    userId = query;
  }

  // 2. Sayısal ID varsa doğrudan bilgileri çek
  if (userId) {
    try {
      const res = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = await res.json();
        username = data.name || null;
      }
    } catch (e) {
      console.error('Roblox user by ID fetch error:', e);
    }
  } else {
    // 3. Kullanıcı adı girilmişse POST ile ID'yi bul
    try {
      const res = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames: [query],
          excludeBannedUsers: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          userId = String(data.data[0].id);
          username = data.data[0].name;
        }
      }
    } catch (e) {
      console.error('Roblox user by username fetch error:', e);
    }
  }

  if (!userId || !username) {
    return null;
  }

  // 4. Avatar Headshot görselini çek
  let avatarUrl: string | null = null;
  try {
    const avatarRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );
    if (avatarRes.ok) {
      const aData = await avatarRes.json();
      if (aData.data && aData.data.length > 0) {
        avatarUrl = aData.data[0].imageUrl || null;
      }
    }
  } catch (e) {
    console.error('Roblox avatar fetch error:', e);
  }

  return {
    username,
    userId,
    avatarUrl,
    profileUrl: `https://www.roblox.com/users/${userId}/profile`,
  };
}
