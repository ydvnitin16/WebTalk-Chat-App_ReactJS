import jwt from "jsonwebtoken";

export const storeToken = (res, userInfo) => {
  const tokenAge = 30 * 24 * 60 * 60 * 1000; //30 days
  const token = jwt.sign(
    {
      id: userInfo._id,
      name: userInfo.name,
      email: userInfo.email,
      username: userInfo.username,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "30d" },
  );

  const isProd = process.env.NODE_ENV === "production";
  // NOTE:
  // - SameSite=None requires Secure=true (HTTPS). In local dev (HTTP) browsers will drop the cookie.
  // - For localhost dev, use SameSite=Lax + Secure=false.
  res.cookie("authHeader", `Bearer ${token}`, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: tokenAge,
  });
};
