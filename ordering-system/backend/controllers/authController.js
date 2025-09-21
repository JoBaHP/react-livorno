const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const ACCESS_COOKIE_NAME = "authToken";
const REFRESH_COOKIE_NAME = "refreshToken";
const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

const generateAccessToken = (payload) =>
  jwt.sign({ ...payload, tokenType: "access" }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

const generateRefreshToken = (payload) =>
  jwt.sign({ ...payload, tokenType: "refresh" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

const buildCookieOptions = (overrides = {}) => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    ...overrides,
  };
};

const issueTokens = (res, payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  res.cookie(
    ACCESS_COOKIE_NAME,
    accessToken,
    buildCookieOptions({ maxAge: ACCESS_MAX_AGE })
  );
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    buildCookieOptions({ maxAge: REFRESH_MAX_AGE })
  );
};

const toResponseUser = (payload = {}) => ({
  id: payload.id,
  username: payload.username,
  role: payload.role,
  name: payload.name || null,
  email: payload.email || null,
  picture: payload.picture || null,
  provider: payload.provider || null,
});

const parseFrontendOrigins = () =>
  (process.env.FRONTEND_URLS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const getPrimaryFrontendUrl = () =>
  process.env.GOOGLE_SUCCESS_REDIRECT || parseFrontendOrigins()[0];

const buildFrontendRedirect = (pathname = "/") => {
  const base = getPrimaryFrontendUrl();
  if (!base) return "/";
  try {
    const url = new URL(pathname, base.endsWith("/") ? base : `${base}/`);
    return url.toString();
  } catch (err) {
    console.error("Failed to construct frontend redirect URL:", err.message);
    return base;
  }
};

const googleRedirectUri = (req) => {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  const protocol = process.env.PUBLIC_API_PROTOCOL || req.protocol;
  const host = process.env.PUBLIC_API_HOST || req.get("host");
  return `${protocol}://${host}/api/auth/google/callback`;
};

const ensureGoogleConfig = () => {
  const requiredVars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing Google OAuth configuration: ${missing.join(", ")}`
    );
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = {
        id: user.id,
        role: user.role,
        username: user.username,
      };

      issueTokens(res, payload);

      res.json({
        user: toResponseUser(payload),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
};

exports.getProfile = (req, res) => {
  res.status(200).json({ user: req.user });
};

const clearAuthCookies = (res) => {
  res.cookie(ACCESS_COOKIE_NAME, "", {
    ...buildCookieOptions(),
    expires: new Date(0),
  });
  res.cookie(REFRESH_COOKIE_NAME, "", {
    ...buildCookieOptions(),
    expires: new Date(0),
  });
};

exports.startGoogleAuth = (req, res) => {
  try {
    ensureGoogleConfig();
    const state = crypto.randomBytes(16).toString("hex");
    res.cookie("oauthState", state, buildCookieOptions({ maxAge: 10 * 60 * 1000 }));

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: googleRedirectUri(req),
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
      access_type: "offline",
    });

    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch (err) {
    console.error("Failed to initiate Google OAuth:", err.message);
    res.status(500).json({ message: "Unable to start Google authentication" });
  }
};

exports.handleGoogleCallback = async (req, res) => {
  const failureRedirect = `${buildFrontendRedirect("/account")}?error=oauth_failed`;
  try {
    ensureGoogleConfig();
    const { code, state } = req.query;
    const storedState = req.cookies.oauthState;

    if (!code) {
      return res.redirect(`${failureRedirect}&reason=missing_code`);
    }
    if (!state || !storedState || state !== storedState) {
      return res.redirect(`${failureRedirect}&reason=state_mismatch`);
    }

    res.clearCookie("oauthState", buildCookieOptions());

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: googleRedirectUri(req),
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Google token exchange failed:", errorText);
      return res.redirect(`${failureRedirect}&reason=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;
    if (!access_token) {
      console.error("Google token response missing access_token");
      return res.redirect(`${failureRedirect}&reason=missing_access_token`);
    }

    const profileResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error("Failed to fetch Google profile:", errorText);
      return res.redirect(`${failureRedirect}&reason=userinfo_failed`);
    }

    const profile = await profileResponse.json();
    const { sub, email, name, picture } = profile;

    const jwtPayload = {
      id: sub,
      role: "customer",
      username: name || email,
      name,
      email,
      picture,
      provider: "google",
    };

    issueTokens(res, jwtPayload);

    return res.redirect(buildFrontendRedirect("/account"));
  } catch (err) {
    console.error("Google OAuth callback failed:", err.message);
    return res.redirect(`${failureRedirect}&reason=server_error`);
  }
};

exports.refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
  if (!refreshToken) {
    clearAuthCookies(res);
    return res.status(401).json({ message: "No refresh token" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.tokenType !== "refresh") {
      throw new Error("Invalid token type");
    }
    const { tokenType, iat, exp, ...payload } = decoded;
    issueTokens(res, payload);
    res.json({ user: toResponseUser(payload) });
  } catch (err) {
    console.error("Refresh token failed:", err.message);
    clearAuthCookies(res);
    res.status(401).json({ message: "Refresh token invalid" });
  }
};
