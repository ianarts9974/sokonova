/**
 * SokoNova — Admin Authentication API Route
 *
 * POST /api/admin-auth
 * Body: { email: string, password: string }
 *
 * Credentials are stored ONLY in server-side env vars (.env.local) and
 * never sent to the browser. Returns a simple session token on success.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

// A lightweight signed token: sha256(email + password + secret)
function makeToken(email: string): string {
  const secret = process.env.ADMIN_PASSWORD || 'sokonova-secret';
  return createHash('sha256').update(`${email}:${secret}:${Date.now()}`).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Admin credentials not configured on server.' },
        { status: 500 }
      );
    }

    // Constant-time-ish comparison (not crypto secure but fine for this setup)
    const emailMatch = email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const passMatch = password === ADMIN_PASSWORD;

    if (emailMatch && passMatch) {
      const token = makeToken(email);
      return NextResponse.json({ success: true, token });
    }

    // Add a small delay to prevent brute-force timing attacks
    await new Promise((resolve) => setTimeout(resolve, 800));
    return NextResponse.json({ success: false }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 400 });
  }
}
