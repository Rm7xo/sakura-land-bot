import axios from 'axios';
import { prisma } from '../db/prisma.js';

export async function handleSallaCallback(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('No code received ❌');
  }

  try {
    // ✅ تجهيز البيانات بالشكل الصحيح
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.SALLA_CLIENT_ID,
      client_secret: process.env.SALLA_CLIENT_SECRET,
      redirect_uri: process.env.SALLA_REDIRECT_URI,
      code
    });

    // ✅ إرسال الطلب لسلة
    const response = await axios.post(
      process.env.SALLA_TOKEN_URL || 'https://accounts.salla.sa/oauth2/token',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    );

    const t = response.data;

    console.log('TOKEN:', t);

    // ✅ حفظ التوكن في قاعدة البيانات
    await prisma.oAuthToken.upsert({
      where: { provider: 'salla' },
      update: {
        accessToken: t.access_token,
        refreshToken: t.refresh_token || null,
        tokenType: t.token_type || null,
        expiresIn: t.expires_in || null,
        scope: t.scope || null
      },
      create: {
        provider: 'salla',
        accessToken: t.access_token,
        refreshToken: t.refresh_token || null,
        tokenType: t.token_type || null,
        expiresIn: t.expires_in || null,
        scope: t.scope || null
      }
    });

    // ✅ نجاح
    return res.send('✅ تم الربط بنجاح!');

  } catch (err) {
    console.error('OAuth Error:', err.response?.data || err.message);
    return res.status(400).send(
      'OAuth Error ❌ ' + JSON.stringify(err.response?.data || err.message)
    );
  }
}

// 🔐 جلب التوكن لاحقًا
export async function getSallaToken() {
  const row = await prisma.oAuthToken.findUnique({
    where: { provider: 'salla' }
  });

  return row?.accessToken || null;
}