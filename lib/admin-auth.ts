import "server-only";

import { cookies } from "next/headers";

import { getAdminAccessKey } from "@/lib/appointments";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { deriveSessionToken, secureCompare, verifySessionToken } from "@/lib/secure-compare";

/**
 * Cookie-based admin session.
 *
 * The access key is NEVER carried in the URL/query string (which leaks into
 * browser history, server access logs and the Referer header). Instead the
 * gate form posts the key to a server action that validates it and stores an
 * HMAC session token derived from it (never the key itself) in an HttpOnly
 * cookie. Admin pages then verify that token against the configured key.
 */
const ADMIN_ACCESS_COOKIE = "ubt_admin_access";
const ADMIN_LABEL = "board:admin";

/**
 * The task board has its own access key/cookie so it can be shared with the
 * project team without handing out the appointment-admin key. Falls back to
 * the appointment-admin key only if its own key is not configured.
 */
const TASKS_ADMIN_ACCESS_COOKIE = "ubt_tasks_admin_access";

/**
 * The BatuBT footer-client board has its own access key/cookie so it can be
 * shared with Batuhan independently of the appointment- and task-admin keys.
 */
const BATUBT_ADMIN_ACCESS_COOKIE = "ubt_batubt_access";

/**
 * The Akçakanat domain board (/bakcakanat) has its own password/cookie so it
 * can be shared independently of every other admin key.
 */
const BAKCAKANAT_ACCESS_COOKIE = "ubt_bakcakanat_access";

const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

async function setBoardCookie(name: string, value: string, path: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path,
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });
}

/**
 * Expires a board cookie with the exact attributes used at sign-in instead of
 * `cookies().delete()`: the plain deletion Set-Cookie carries no Secure/
 * HttpOnly/SameSite flags, and browsers can refuse to drop a Secure cookie
 * (set in production over HTTPS) without attribute parity.
 */
async function clearBoardCookie(name: string, path: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path,
    maxAge: 0
  });
}

function parseNamedToken(value: string): { name: string; token: string } | null {
  const separator = value.lastIndexOf("|");
  if (separator < 0) return null;
  return {
    name: value.slice(0, separator).trim().toLowerCase(),
    token: value.slice(separator + 1)
  };
}

/**
 * Site-wide super-admin session.
 *
 * Every board cookie above is path-scoped (`/admin`, `/dm`, `/batubt`, …), so
 * the admin cookie is never even sent to the other boards — signing into the
 * admin panel could not unlock them no matter how the checks were written.
 * This second cookie is scoped to `/` and is minted alongside the admin cookie
 * at sign-in; each board's gate ORs it in, so whoever holds the appointment
 * admin key walks into every board without re-entering its password.
 *
 * The value is an HMAC of a fixed label keyed by the admin key itself (the same
 * pattern /detrbridge and /ubtsa already use), not the key itself: a leaked
 * cookie never exposes the reusable literal key, and rotating
 * APPOINTMENT_ADMIN_ACCESS_KEY revokes every super-admin session at once
 * because verification re-derives from the *current* value.
 */
const SUPER_ADMIN_COOKIE = "ubt_super_admin";
const SUPER_ADMIN_LABEL = "super";

/**
 * Identity a super admin assumes on the name-based boards. Both
 * DETRBRIDGE_ALLOWED_NAMES and UBTSA_ALLOWED_NAMES already contain it, and it
 * is what gets stamped on comments written through a super-admin session.
 */
const SUPER_ADMIN_BOARD_NAME = "ubt";

/**
 * Grants the site-wide super-admin session. Only ever called after the admin
 * key has been verified.
 */
async function grantSuperAdmin(accessKey: string): Promise<void> {
  await setBoardCookie(SUPER_ADMIN_COOKIE, deriveSessionToken(accessKey, SUPER_ADMIN_LABEL), "/");
}

/**
 * Clears the super-admin session. Expires the cookie with the exact attributes
 * used at sign-in — see clearBoardCookie for why.
 */
async function revokeSuperAdmin(): Promise<void> {
  await clearBoardCookie(SUPER_ADMIN_COOKIE, "/");
}

/**
 * True when the current request carries a valid super-admin session.
 *
 * Fails CLOSED: without a configured APPOINTMENT_ADMIN_ACCESS_KEY no cookie can
 * verify, so a forgotten env var never turns into blanket access.
 */
export async function isSuperAdmin(): Promise<boolean> {
  const accessKey = getAdminAccessKey();
  if (!accessKey) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPER_ADMIN_COOKIE)?.value ?? "";
  if (!token) return false;
  return verifySessionToken(token, accessKey, SUPER_ADMIN_LABEL);
}

/**
 * True when the current request already carries a valid admin session cookie.
 *
 * Fails CLOSED: without a configured APPOINTMENT_ADMIN_ACCESS_KEY no cookie can
 * verify.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  if (await isSuperAdmin()) return true;
  const accessKey = getAdminAccessKey();
  if (!accessKey) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value ?? "";
  if (!token) return false;
  return verifySessionToken(token, accessKey, ADMIN_LABEL);
}

/**
 * Validates the supplied key and, when correct, persists an HMAC session token
 * in an HttpOnly cookie. Returns whether the sign-in was accepted.
 */
export async function signInAdmin(candidate: string): Promise<boolean> {
  const accessKey = getAdminAccessKey();

  // Fail closed: without a configured key no sign-in is possible.
  if (!accessKey) {
    return false;
  }

  if (!checkRateLimit(`admin:${await getClientIp()}`)) {
    return false;
  }

  if (!secureCompare(candidate.trim(), accessKey)) {
    return false;
  }

  await setBoardCookie(ADMIN_ACCESS_COOKIE, deriveSessionToken(accessKey, ADMIN_LABEL), "/admin");

  // Signing into the admin panel is what makes someone a super admin.
  await grantSuperAdmin(accessKey);

  return true;
}

/**
 * Clears the admin session cookie (sign out). Expires it with the exact
 * attributes used at sign-in — see clearBoardCookie for why.
 */
export async function signOutAdmin(): Promise<void> {
  await clearBoardCookie(ADMIN_ACCESS_COOKIE, "/admin");
  await revokeSuperAdmin();
}

interface PasswordGateConfig {
  getSecret: () => string;
  cookieName: string;
  path: string;
  boardKey: string;
}

interface PasswordGate {
  isAuthenticated: () => Promise<boolean>;
  signIn: (candidate: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

/**
 * Shared-secret board gate: the cookie stores an HMAC token derived from the
 * secret and the board key (never the secret itself), so a leaked cookie does
 * not reveal the password and a token from one board never opens another, even
 * where two boards share a secret. Fails CLOSED: without a configured secret
 * nobody gets in and no sign-in is possible. Sign-out also revokes the
 * super-admin session, otherwise a super admin's "sign out" would appear to do
 * nothing because the gate would keep letting them back in through the
 * site-wide cookie.
 */
function createPasswordGate({
  getSecret,
  cookieName,
  path,
  boardKey
}: PasswordGateConfig): PasswordGate {
  return {
    async isAuthenticated() {
      if (await isSuperAdmin()) return true;
      const secret = getSecret();
      if (!secret) return false;
      const cookieStore = await cookies();
      const token = cookieStore.get(cookieName)?.value ?? "";
      if (!token) return false;
      return verifySessionToken(token, secret, `board:${boardKey}`);
    },
    async signIn(candidate) {
      const secret = getSecret();
      if (!secret) return false;
      if (!checkRateLimit(`${boardKey}:${await getClientIp()}`)) return false;
      if (!secureCompare(candidate.trim(), secret)) return false;

      await setBoardCookie(cookieName, deriveSessionToken(secret, `board:${boardKey}`), path);

      return true;
    },
    async signOut() {
      await clearBoardCookie(cookieName, path);
      await revokeSuperAdmin();
    }
  };
}

/**
 * Reads the task-board admin key (empty string if neither it nor the
 * appointment-admin fallback is configured).
 */
function getTasksAdminAccessKey(): string {
  const taskKey = process.env.DESIREMAPTODO_ADMIN_ACCESS_KEY?.trim();
  if (taskKey) return taskKey;
  // Fallback keeps the board reachable if only the shared admin key is set.
  return process.env.APPOINTMENT_ADMIN_ACCESS_KEY?.trim() ?? "";
}

const tasksGate = createPasswordGate({
  getSecret: getTasksAdminAccessKey,
  cookieName: TASKS_ADMIN_ACCESS_COOKIE,
  path: "/dm",
  boardKey: "dm"
});

export const isTasksAdminAuthenticated = tasksGate.isAuthenticated;
export const signInTasksAdmin = tasksGate.signIn;
export const signOutTasksAdmin = tasksGate.signOut;

/**
 * Reads the BatuBT footer-board admin key (empty string if not configured).
 * No fallback: the board is gated solely by BATUBT_ADMIN_ACCESS_KEY.
 */
function getBatubtAdminAccessKey(): string {
  return process.env.BATUBT_ADMIN_ACCESS_KEY?.trim() ?? "";
}

const batubtGate = createPasswordGate({
  getSecret: getBatubtAdminAccessKey,
  cookieName: BATUBT_ADMIN_ACCESS_COOKIE,
  path: "/batubt",
  boardKey: "batubt"
});

export const isBatubtAuthenticated = batubtGate.isAuthenticated;
export const signInBatubt = batubtGate.signIn;
export const signOutBatubt = batubtGate.signOut;

/**
 * Reads the Akçakanat domain-board password (empty string if not configured).
 * No fallback: the board is gated solely by BAKCAKANAT_PASSWORD.
 */
function getBakcakanatPassword(): string {
  return process.env.BAKCAKANAT_PASSWORD?.trim() ?? "";
}

const bakcakanatGate = createPasswordGate({
  getSecret: getBakcakanatPassword,
  cookieName: BAKCAKANAT_ACCESS_COOKIE,
  path: "/bakcakanat",
  boardKey: "bakcakanat"
});

export const isBakcakanatAuthenticated = bakcakanatGate.isAuthenticated;
export const signInBakcakanat = bakcakanatGate.signIn;
export const signOutBakcakanat = bakcakanatGate.signOut;

/**
 * The `/detrbridge` logo-selection board is gated by a name allowlist plus
 * a shared password (DETRBRIDGE), mirroring the /detr todo board's
 * email-allowlist pattern but with plain first names instead of emails.
 * The cookie stores `name|token`, where token is an HMAC of the name keyed
 * by the current password (see deriveSessionToken) rather than the raw
 * password itself — a leaked cookie no longer hands out the reusable
 * literal board password, and a password change still revokes every
 * existing session because verification re-derives the token from the
 * *current* DETRBRIDGE value. Fails CLOSED: without a configured password
 * nobody gets in.
 */
const DETRBRIDGE_ACCESS_COOKIE = "ubt_detrbridge_access";

/** Allowlisted names for the detrbridge board (lowercase, no diacritics-sensitivity issues). */
const DETRBRIDGE_ALLOWED_NAMES = [
  "sefa",
  "sümeyye",
  "fatih",
  "ubt",
  "şahin",
  "murat",
  "aslıhan"
];

/**
 * Reads the detrbridge board password (empty string if not configured).
 * No fallback: the board is gated solely by DETRBRIDGE.
 */
function getDetrbridgePassword(): string {
  return process.env.DETRBRIDGE?.trim() ?? "";
}

/** Normalized (lowercase) name allowlist for the detrbridge board. */
function getDetrbridgeAllowedNames(): string[] {
  return DETRBRIDGE_ALLOWED_NAMES.map((name) => name.trim().toLowerCase());
}

/**
 * Returns the signed-in detrbridge name, or null when the session is
 * invalid. Fails CLOSED: without a configured password nobody gets in.
 */
export async function getDetrbridgeSessionName(): Promise<string | null> {
  if (await isSuperAdmin()) return SUPER_ADMIN_BOARD_NAME;
  const password = getDetrbridgePassword();
  if (!password) return null;
  const cookieStore = await cookies();
  const parsed = parseNamedToken(cookieStore.get(DETRBRIDGE_ACCESS_COOKIE)?.value ?? "");
  if (!parsed) return null;
  const { name, token } = parsed;
  if (!getDetrbridgeAllowedNames().includes(name)) return null;
  if (!verifySessionToken(token, password, name)) return null;
  return name;
}

/**
 * True when the current request carries a valid detrbridge session cookie.
 *
 * Fails CLOSED: if DETRBRIDGE is not configured, nobody gets in — the board
 * must never be publicly reachable just because an env var was forgotten.
 */
export async function isDetrbridgeAuthenticated(): Promise<boolean> {
  return (await getDetrbridgeSessionName()) !== null;
}

/**
 * Validates the supplied name (against the allowlist) and password and,
 * when both are correct, persists them in an HttpOnly cookie scoped to
 * /detrbridge. Returns the normalized name on success (so the caller can log
 * the sign-in without re-deriving the same normalization), or null on
 * failure.
 */
export async function signInDetrbridge(
  name: string,
  candidate: string
): Promise<string | null> {
  const password = getDetrbridgePassword();
  // Fail closed: without a configured password no sign-in is possible.
  if (!password) return null;
  const normalizedName = name.trim().toLowerCase();
  if (!normalizedName) return null;
  if (!getDetrbridgeAllowedNames().includes(normalizedName)) return null;
  if (!checkRateLimit(`detrbridge:${await getClientIp()}`)) return null;
  if (!secureCompare(candidate.trim(), password)) return null;

  const token = deriveSessionToken(password, normalizedName);
  await setBoardCookie(DETRBRIDGE_ACCESS_COOKIE, `${normalizedName}|${token}`, "/detrbridge");

  return normalizedName;
}

/**
 * Clears the detrbridge session cookie (sign out). Expires it with the
 * exact attributes used at sign-in — see clearBoardCookie for why. Also
 * revokes the super-admin session, for the reason given in signOutTasksAdmin.
 */
export async function signOutDetrbridge(): Promise<void> {
  await clearBoardCookie(DETRBRIDGE_ACCESS_COOKIE, "/detrbridge");
  await revokeSuperAdmin();
}

/**
 * The `/ubtsa` konsept board is gated by a small name allowlist where **each
 * person has their own password**, unlike /detrbridge's single shared secret:
 * `ubt` signs in with UBT_UBTSA_PASSWORD, `serkan` with UBTSA_PASSWORD. That
 * way either credential can be rotated (or revoked) without locking the other
 * person out, and a password handed to one person never opens the board under
 * the other's name.
 *
 * The cookie stores `name|token`, where token is an HMAC of the name keyed by
 * *that name's* password — a leaked cookie never exposes the literal password,
 * and changing a password revokes only that person's sessions because
 * verification re-derives the token from the current value. The signed-in name
 * is stamped on every comment, so it has to be trustworthy.
 */
const UBTSA_ACCESS_COOKIE = "ubt_ubtsa_access";

/** Allowlisted names for the ubtsa board (lowercase). */
const UBTSA_ALLOWED_NAMES = ["ubt", "serkan"];

/** The two people who may sign in — exported for the gate's name picker. */
export const UBTSA_NAMES: readonly string[] = UBTSA_ALLOWED_NAMES;

/**
 * Reads the password belonging to one ubtsa user (empty string when that
 * user has no password configured, or the name is not on the allowlist).
 *
 * Deliberately a static switch rather than `process.env[variable]`: static
 * access is what Next.js's env handling is built around, so this keeps
 * working the same way in every build target.
 */
function getUbtsaPasswordFor(name: string): string {
  switch (name) {
    case "ubt":
      return process.env.UBT_UBTSA_PASSWORD?.trim() ?? "";
    case "serkan":
      return process.env.UBTSA_PASSWORD?.trim() ?? "";
    default:
      return "";
  }
}

/** Normalized (lowercase) name allowlist for the ubtsa board. */
function getUbtsaAllowedNames(): string[] {
  return UBTSA_ALLOWED_NAMES.map((name) => name.trim().toLowerCase());
}

/**
 * Returns the signed-in ubtsa name, or null when the session is invalid.
 * Fails CLOSED per user: if that person's password is not configured, their
 * session does not verify.
 */
export async function getUbtsaSessionName(): Promise<string | null> {
  if (await isSuperAdmin()) return SUPER_ADMIN_BOARD_NAME;
  const cookieStore = await cookies();
  const parsed = parseNamedToken(cookieStore.get(UBTSA_ACCESS_COOKIE)?.value ?? "");
  if (!parsed) return null;
  const { name, token } = parsed;
  if (!getUbtsaAllowedNames().includes(name)) return null;
  const password = getUbtsaPasswordFor(name);
  if (!password) return null;
  if (!verifySessionToken(token, password, name)) return null;
  return name;
}

/**
 * Validates the supplied name (against the allowlist) and that person's own
 * password and, when both are correct, persists them in an HttpOnly cookie
 * scoped to /ubtsa. Returns the normalized name on success, or null on
 * failure.
 *
 * Because each name has its own password, entering ubt's password while
 * "serkan" is selected fails — the credential is checked against the chosen
 * identity, not against a pool.
 */
export async function signInUbtsa(
  name: string,
  candidate: string
): Promise<string | null> {
  const normalizedName = name.trim().toLowerCase();
  if (!normalizedName) return null;
  if (!getUbtsaAllowedNames().includes(normalizedName)) return null;
  const password = getUbtsaPasswordFor(normalizedName);
  // Fail closed: without a configured password for this user, no sign-in.
  if (!password) return null;
  if (!checkRateLimit(`ubtsa:${await getClientIp()}`)) return null;
  if (!secureCompare(candidate.trim(), password)) return null;

  const token = deriveSessionToken(password, normalizedName);
  await setBoardCookie(UBTSA_ACCESS_COOKIE, `${normalizedName}|${token}`, "/ubtsa");

  return normalizedName;
}

/**
 * Clears the ubtsa session cookie (sign out). Expires it with the exact
 * attributes used at sign-in — see clearBoardCookie for why. Also revokes the
 * super-admin session, for the reason given in signOutTasksAdmin.
 */
export async function signOutUbtsa(): Promise<void> {
  await clearBoardCookie(UBTSA_ACCESS_COOKIE, "/ubtsa");
  await revokeSuperAdmin();
}

/**
 * The `/newdragoman` redesign proposal (a self-contained HTML document shared
 * with the Dragoman side) is gated by a single shared password, like
 * /bakcakanat — nothing on the page is written, so there is no identity to
 * stamp and no need for a name allowlist.
 *
 * The cookie stores an HMAC of a fixed label keyed by the current password
 * rather than the password itself, so a leaked cookie never hands out the
 * reusable literal secret and rotating the password revokes every session.
 */
const NEWDRAGOMAN_ACCESS_COOKIE = "ubt_newdragoman_access";
const NEWDRAGOMAN_LABEL = "newdragoman";

/**
 * Deliberately a literal default, unlike every other gate in this file: the
 * proposal is read-only marketing material handed to the Dragoman side, so the
 * password is meant to be trivially shareable rather than secret. Set
 * NEWDRAGOMAN_PASSWORD on the host to override it.
 */
const NEWDRAGOMAN_DEFAULT_PASSWORD = "ubt";

/** Reads the /newdragoman password (env override, else the shared default). */
function getNewdragomanPassword(): string {
  return process.env.NEWDRAGOMAN_PASSWORD?.trim() || NEWDRAGOMAN_DEFAULT_PASSWORD;
}

/**
 * True when the current request carries a valid /newdragoman session cookie.
 *
 * Unlike the other boards this does NOT honour the super-admin cookie: the
 * point of the page is to show the gate the Dragoman side will see, and a
 * signed-in admin walking straight in hides exactly that.
 */
export async function isNewdragomanAuthenticated(): Promise<boolean> {
  const password = getNewdragomanPassword();
  if (!password) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(NEWDRAGOMAN_ACCESS_COOKIE)?.value ?? "";
  if (!token) return false;
  return verifySessionToken(token, password, NEWDRAGOMAN_LABEL);
}

/**
 * Validates the supplied password and, when correct, persists an opaque
 * session token in an HttpOnly cookie scoped to /newdragoman. Returns whether
 * the sign-in was accepted.
 */
export async function signInNewdragoman(candidate: string): Promise<boolean> {
  const password = getNewdragomanPassword();
  // Fail closed: without a configured password no sign-in is possible.
  if (!password) return false;
  if (!checkRateLimit(`newdragoman:${await getClientIp()}`)) return false;
  if (!secureCompare(candidate.trim(), password)) return false;

  await setBoardCookie(
    NEWDRAGOMAN_ACCESS_COOKIE,
    deriveSessionToken(password, NEWDRAGOMAN_LABEL),
    "/newdragoman"
  );

  return true;
}

/**
 * Clears the /newdragoman session cookie (sign out). Expires it with the exact
 * attributes used at sign-in — see clearBoardCookie for why. The super-admin
 * session is left alone here: this gate ignores it, so revoking it would sign
 * the admin out of every other board for no reason.
 */
export async function signOutNewdragoman(): Promise<void> {
  await clearBoardCookie(NEWDRAGOMAN_ACCESS_COOKIE, "/newdragoman");
}
