const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";

export function appPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}

export function lobbyUrl(code: string): string {
  if (siteUrl) {
    return `${siteUrl}/lobby?code=${code}`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}${appPath(`/lobby?code=${code}`)}`;
  }
  return appPath(`/lobby?code=${code}`);
}

export function gameUrl(code: string): string {
  if (siteUrl) return `${siteUrl}/game?code=${code}`;
  return appPath(`/game?code=${code}`);
}

export function resultsUrl(gameId: string): string {
  if (siteUrl) return `${siteUrl}/results?gameId=${gameId}`;
  return appPath(`/results?gameId=${gameId}`);
}
