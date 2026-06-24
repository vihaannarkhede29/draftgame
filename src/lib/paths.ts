const repo = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function appPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${repo}${normalized}`;
}

export function lobbyUrl(code: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${appPath(`/lobby?code=${code}`)}`;
  }
  return appPath(`/lobby?code=${code}`);
}

export function gameUrl(code: string): string {
  return appPath(`/game?code=${code}`);
}

export function resultsUrl(gameId: string): string {
  return appPath(`/results?gameId=${gameId}`);
}
