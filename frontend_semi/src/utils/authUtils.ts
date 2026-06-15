type JwtPayload = {
  exp?: number;
  [key: string]: unknown;
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split(".")[1];

    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => {
          return `%${("00" + char.charCodeAt(0).toString(16)).slice(-2)}`;
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("JWT 파싱 실패:", error);
    return null;
  }
};

export const isJwtExpired = (token: string) => {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);

  return payload.exp <= now;
};
