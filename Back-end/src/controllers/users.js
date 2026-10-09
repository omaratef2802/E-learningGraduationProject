const crypto = require("node:crypto");
const userService = require("../services/users");
const userModule = require("../modules/dbUsers");
const adminModule = require("../modules/dbAdmin");

const getAllUser = async (req, res, next) => {
  try {
    const { limit, skip } = req.query;
    const users = await userService.getAllUser(userModule, "student", limit, skip);

    return res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try { const user = await userService.getUserById(userModule, req.id); return res.status(200).json({ message: "User fetched successfully", data: user }); }
  catch (err) { next(err); }
};
const creatUser = async (req, res, next) => {
  try { const user = await userService.creatUser(userModule, req.body); return res.status(201).json({ message: "User created successfully", data: user }); }
  catch (err) { next(err); }
};
const updateUser = async (req, res, next) => {
  try { const user = await userService.updateUser(userModule, req.body, req.id); return res.status(200).json({ message: "User updated successfully", data: user }); }
  catch (err) { next(err); }
};
const updatePassword = async (req, res, next) => {
  try { const { currentPassword, confirmPassword, newPassword } = req.body; const token = await userService.updatePassword(userModule, req.id, currentPassword, confirmPassword, newPassword); return res.status(200).json({ message: "Password updated successfully", data: token }); }
  catch (err) { next(err); }
};
const login = async (req, res, next) => {
  try { const { email, password } = req.body; const token = await userService.loginUserOrAdmin(userModule, adminModule, email, password); return res.status(200).json({ message: "Login successfully", data: token }); }
  catch (err) { next(err); }
};
const uploadImage = async (req, res, next) => {
  try { const image = await userService.uploadImage(userModule, req.id, req.file); return res.status(200).json({ message: "Image uploaded successfully", data: { image } }); }
  catch (err) { next(err); }
};
const googleLogin = async (req, res, next) => {
  try {
    const token = await userService.googleLogin(req.user);
    res.set("Cache-Control", "no-store");
    return res.redirect(`${oauthFrontendUrl()}/auth/callback#token=${encodeURIComponent(token)}`);
  }
  catch (err) { next(err); }
};

const oauthFrontendUrl = () => {
  const configured = process.env.OAUTH_FRONTEND_URL || process.env.FRONTEND_URL?.split(",")[0]?.trim();
  return (configured || "http://localhost:4200").replace(/\/$/, "");
};

const oauthFailure = (provider, reason = "failed") =>
  `${oauthFrontendUrl()}/login?oauthError=${encodeURIComponent(`${provider}_${reason}`)}`;

const githubCallback = async (req, res) => {
  const cookieHeader = req.headers.cookie || "";
  const stateCookie = cookieHeader.match(/(?:^|;\s*)github_oauth_state=([^;]+)/)?.[1];
  res.clearCookie("github_oauth_state", { path: "/E-learning/users" });

  if (!req.query.state || !stateCookie || req.query.state !== stateCookie) {
    return res.redirect(oauthFailure("github", "state"));
  }
  if (req.query.error || !req.query.code) return res.redirect(oauthFailure("github", "cancelled"));

  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) return res.redirect(oauthFailure("github", "not_configured"));

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: req.query.code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) throw new Error("GitHub token exchange failed");

    const githubHeaders = {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "PathwayEd",
    };
    const [profileResponse, emailsResponse] = await Promise.all([
      fetch("https://api.github.com/user", { headers: githubHeaders }),
      fetch("https://api.github.com/user/emails", { headers: githubHeaders }),
    ]);
    if (!profileResponse.ok || !emailsResponse.ok) throw new Error("GitHub profile lookup failed");
    const [profile, emails] = await Promise.all([profileResponse.json(), emailsResponse.json()]);
    const verifiedEmail = emails.find((entry) => entry.primary && entry.verified)?.email
      || emails.find((entry) => entry.verified)?.email
      || profile.email;
    if (!verifiedEmail) return res.redirect(oauthFailure("github", "email_required"));

    const token = await userService.githubLogin({
      id: profile.id,
      email: verifiedEmail,
      name: profile.name || profile.login,
      avatar: profile.avatar_url,
    });
    res.set("Cache-Control", "no-store");
    return res.redirect(`${oauthFrontendUrl()}/auth/callback#token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error("GitHub OAuth failed:", error.message);
    return res.redirect(oauthFailure("github"));
  }
};

const githubStart = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL;
  if (!clientId || !process.env.GITHUB_CLIENT_SECRET || !callbackUrl) {
    return res.redirect(oauthFailure("github", "not_configured"));
  }

  const state = crypto.randomBytes(24).toString("hex");
  res.cookie("github_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
    path: "/E-learning/users",
  });
  const authorizationUrl = new URL("https://github.com/login/oauth/authorize");
  authorizationUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: "read:user user:email",
    state,
  }).toString();
  return res.redirect(authorizationUrl.toString());
};
const forgetPassword = async (req, res, next) => {
  try { const token = await userService.forgetPassword(userModule, req.body.email); return res.status(200).json({ message: "OTP sent successfully", data: token }); }
  catch (err) { next(err); }
};
const verifyOtp = async (req, res, next) => {
  try { const token = await userService.verifyOtp(req.body.otp, req.id); return res.status(200).json({ message: "OTP verified successfully", data: token }); }
  catch (err) { next(err); }
};
const changePassword = async (req, res, next) => {
  try { const result = await userService.changePassword(userModule, req.body.newPassword, req.body.confirmPassword, req.id); return res.status(200).json({ message: result }); }
  catch (err) { next(err); }
};
module.exports = { getAllUser, getUserById, creatUser, updateUser, updatePassword, login, uploadImage, googleLogin, githubStart, githubCallback, forgetPassword, verifyOtp, changePassword };
