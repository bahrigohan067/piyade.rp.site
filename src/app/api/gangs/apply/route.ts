import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { GANG_ROLES } from '@/lib/constants';
import { submitGangApplication } from '@/lib/gangs';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }

  // Yalnızca @| İllegal rolüne sahip olanlar çete başvurusu yapabilir
  if (!session.roles.includes(GANG_ROLES.ILLEGAL)) {
    return NextResponse.json({ error: 'Çete kurmak için @| İllegal rolüne sahip olmalısınız.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { gangName, colorId, parsel, story, invitedMemberIds } = body;

    if (!gangName || !colorId || !parsel || !story) {
      return NextResponse.json({ error: 'Lütfen tüm başvuru alanlarını eksiksiz doldurun.' }, { status: 400 });
    }

    if (!Array.isArray(invitedMemberIds) || invitedMemberIds.length < 3) {
      return NextResponse.json({ error: 'Başlangıç için en az 3 geçerli çete üyesi seçmelisiniz.' }, { status: 400 });
    }

    const result = await submitGangApplication({
      bossId: session.id,
      bossUsername: session.username,
      gangName: gangName.trim(),
      colorId: String(colorId).trim(),
      parsel: String(parsel).trim(),
      story: story.trim(),
      invitedMemberIds,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
