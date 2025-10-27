import crypto from "crypto";

export const COOKIE_NAME = "pdfqa_auth";

function b64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

// Default to HTTP (not secure). We'll pass true from API when behind HTTPS.
export function commonCookieAttrs(isHttps: boolean = false) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isHttps,
    path: "/",
    // no 'domain' for IP hosts; add domain: ".yourdomain.com" if you always use a domain
  };
}

export function createSessionCookie(isHttps: boolean = false) {
  const ttl = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 24 * 7);
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + ttl,
  };
  const secret = process.env.SESSION_SECRET!;
  const body = Buffer.from(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", secret).update(body).digest();
  const token = `${b64url(body)}.${b64url(sig)}`;

  return {
    name: COOKIE_NAME,
    value: token,
    maxAge: ttl,
    ...commonCookieAttrs(isHttps),
  };
}

export function clearCookie(isHttps: boolean = false) {
  return {
    name: COOKIE_NAME,
    value: "",
    maxAge: 0,
    expires: new Date(0),
    ...commonCookieAttrs(isHttps),
  };
}

export function verifySessionCookie(token?: string) {
  if (!token) return false;
  const [bodyB64, sigB64] = token.split(".");
  if (!bodyB64 || !sigB64) return false;

  const secret = process.env.SESSION_SECRET!;
  const body = Buffer.from(
    bodyB64.replace(/-/g, "+").replace(/_/g, "/") + "==",
    "base64"
  );
  const given = Buffer.from(
    sigB64.replace(/-/g, "+").replace(/_/g, "/") + "==",
    "base64"
  );
  const expect = crypto.createHmac("sha256", secret).update(body).digest();
  if (given.length !== expect.length || !crypto.timingSafeEqual(given, expect))
    return false;

  try {
    const { exp } = JSON.parse(body.toString());
    return typeof exp === "number" && Date.now() / 1000 < exp;
  } catch {
    return false;
  }
}
