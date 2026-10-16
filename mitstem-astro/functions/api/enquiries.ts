/**
 * Cloudflare Pages Function. Receives a public contact-form POST and saves it
 * in Supabase. Requires Cloudflare Pages (not static hosting alone).
 * Secrets are read ONLY from Cloudflare's server-side environment.
 */
interface Env {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}

interface Submission {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  stage?: unknown;
  message?: unknown;
  consent_to_contact?: unknown;
  company?: unknown; // honeypot; must be empty
  turnstile_token?: unknown;
}

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

const stages = new Set([
  'Not specified', 'Primary', 'Lower secondary',
  'IGCSE / O Level', 'AS / A Level', 'General enquiry',
]);

const getString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  // Same-origin form only. Security also relies on mandatory Turnstile verification.
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) {
    return json({ error: 'Origin not allowed.' }, 403);
  }
  if (!request.headers.get('Content-Type')?.includes('application/json')) {
    return json({ error: 'Send JSON data.' }, 415);
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY || !env.TURNSTILE_SECRET_KEY) {
    return json({ error: 'Contact form is not configured yet.' }, 503);
  }
  // Prevent accidentally deploying Cloudflare's dummy test key to production.
  if (new URL(request.url).hostname !== 'localhost' &&
      env.TURNSTILE_SECRET_KEY === '1x0000000000000000000000000000000AA') {
    return json({ error: 'Production spam protection is not configured.' }, 503);
  }

  let data: Submission;
  try {
    const raw = await request.text();
    if (raw.length > 16000) return json({ error: 'Submission is too long.' }, 413);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return json({ error: 'Invalid form data.' }, 400);
    }
    data = parsed as Submission;
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }

  // Trap basic bots without inserting their content.
  if (getString(data.company)) return json({ success: true }, 201);

  const full_name = getString(data.name);
  const email = getString(data.email);
  const phone = getString(data.phone);
  const stage = getString(data.stage) || 'Not specified';
  const message = getString(data.message);
  const token = getString(data.turnstile_token);

  if (full_name.length < 2 || full_name.length > 120 ||
      email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phone.length > 40 || !stages.has(stage) ||
      message.length < 10 || message.length > 3000 ||
      data.consent_to_contact !== true || !token || token.length > 2048) {
    return json({ error: 'Please check the required fields and verification.' }, 400);
  }

  try {
    const verificationBody = new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
    });
    const clientIp = request.headers.get('CF-Connecting-IP');
    if (clientIp) verificationBody.set('remoteip', clientIp);

    const challengeRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: verificationBody },
    );
    if (!challengeRes.ok) return json({ error: 'Verification is unavailable. Try again.' }, 502);
    const verified = await challengeRes.json() as { success?: boolean };
    if (!verified.success) {
      return json({ error: 'Security verification failed. Please try again.' }, 400);
    }

    const supabaseUrl = new URL(env.SUPABASE_URL);
    if (supabaseUrl.protocol !== 'https:' ||
        !supabaseUrl.hostname.endsWith('.supabase.co')) {
      return json({ error: 'Database configuration is invalid.' }, 503);
    }
    const saveUrl = new URL('/rest/v1/website_enquiries', supabaseUrl);
    const saveRes = await fetch(saveUrl.toString(), {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SECRET_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        full_name, email, phone: phone || null, stage, message,
        consent_to_contact: true,
      }),
    });

    if (!saveRes.ok) {
      // Don't log personal details or secret keys.
      console.error('Supabase enquiry insert failed; HTTP status:', saveRes.status);
      return json({ error: 'Could not save the enquiry. Please try later.' }, 502);
    }
    return json({ success: true, message: 'Your enquiry has been received.' }, 201);
  } catch {
    return json({ error: 'A temporary server error occurred. Please try later.' }, 502);
  }
};
