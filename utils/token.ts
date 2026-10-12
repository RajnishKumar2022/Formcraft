import JWT from "jsonwebtoken";

function getTokenSecret(name: "ACCESS_TOKEN_SECRET" | "REFRESH_TOKEN_SECRET") {
  const secret = process.env[name];
  if (!secret) {
    throw new Error(`${name} is not configured`);
  }
  return secret;
}

function generateAccessToken(id: string): string {
  const token = JWT.sign({ id }, getTokenSecret("ACCESS_TOKEN_SECRET"), {
    expiresIn: "15m",
  });
  return token;
}


export interface TokenPayload {
  id: string;
}

function generateRefreshToken(payload: TokenPayload): string {
  return JWT.sign(payload, getTokenSecret("REFRESH_TOKEN_SECRET"), {
    expiresIn: "7d",
  });
}

function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = JWT.verify(token, getTokenSecret("ACCESS_TOKEN_SECRET"));
    if (typeof decoded === "string" || typeof decoded.id !== "string") {
      return null;
    }
    return { id: decoded.id };
  } catch {
    return null; // Token is expired, malformed, or signature is invalid
  }
}

function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = JWT.verify(token, getTokenSecret("REFRESH_TOKEN_SECRET"));
    if (typeof decoded === "string" || typeof decoded.id !== "string") {
      return null;
    }
    return { id: decoded.id };
  } catch {
    return null;
  }
}

export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}