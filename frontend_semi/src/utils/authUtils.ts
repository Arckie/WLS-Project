type JwtPayload = {
    exp?: number;
    role?: string;
    loginId?: string;
    name?: string;
    [key: string]: unknown;
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
    try {
        const base64Url = token.split(".")[1];

        if (!base64Url) {
            return null;
        }

        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

        const paddedBase64 = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            "="
        );

        const jsonPayload = decodeURIComponent(
            atob(paddedBase64)
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

export const getRoleFromToken = (): string | null => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        return null;
    }

    if (isJwtExpired(token)) {
        return null;
    }

    const payload = decodeJwtPayload(token);

    if (typeof payload?.role === "string") {
        return payload.role;
    }

    return null;
};

export const isAdminFromToken = (): boolean => {
    const role = getRoleFromToken();

    return role === "ADMIN" || role === "ROLE_ADMIN";
};