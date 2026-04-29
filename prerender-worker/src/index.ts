interface Env {
  PRERENDER_TOKEN: string;
  PRERENDER_HOSTS?: string;
  PRERENDER_SERVICE_URL?: string;
}

const BOT_AGENTS = [
  "googlebot",
  "yahoo! slurp",
  "bingbot",
  "yandex",
  "baiduspider",
  "duckduckbot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "discordbot",
  "telegrambot",
  "whatsapp",
  "redditbot",
  "embedly",
  "quora link preview",
  "pinterestbot",
  "applebot",
  "chrome-lighthouse",
  "google-inspectiontool",
  "chatgpt-user",
  "gptbot",
  "oai-searchbot",
  "claudebot",
  "claude-user",
  "anthropic-ai",
  "perplexitybot",
  "bytespider",
  "amazonbot",
];

const IGNORE_EXTENSIONS = [
  ".js",
  ".css",
  ".xml",
  ".less",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".pdf",
  ".doc",
  ".txt",
  ".ico",
  ".rss",
  ".zip",
  ".mp3",
  ".rar",
  ".exe",
  ".wmv",
  ".avi",
  ".ppt",
  ".mpg",
  ".mpeg",
  ".tif",
  ".wav",
  ".mov",
  ".psd",
  ".ai",
  ".xls",
  ".mp4",
  ".m4a",
  ".swf",
  ".dat",
  ".dmg",
  ".iso",
  ".flv",
  ".m4v",
  ".torrent",
  ".woff",
  ".woff2",
  ".ttf",
  ".svg",
  ".webmanifest",
  ".map",
  ".json",
];

const DEFAULT_SERVICE_URL = "https://service.prerender.io";
const SPA_FALLBACK_PATH = "/";
const EXCLUDED_PATH_PREFIXES = ["/api/", "/api", "/og/", "/og"];

function containsOneOfThem(values: string[], input: string): boolean {
  return values.some((value) => input.includes(value));
}

function isOneOfThem(values: string[], input: string): boolean {
  return values.some((value) => value === input);
}

function normalizeHosts(rawHosts: string | undefined): string[] {
  return (rawHosts ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

function isSpaRouteCandidate(request: Request, hosts: string[]): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }

  const url = new URL(request.url);
  const extensionIndex = url.pathname.lastIndexOf(".");
  const extension =
    extensionIndex >= 0 ? url.pathname.slice(extensionIndex).toLowerCase() : "";

  if (hosts.length > 0 && !isOneOfThem(hosts, url.hostname.toLowerCase())) {
    return false;
  }

  if (extension && isOneOfThem(IGNORE_EXTENSIONS, extension)) {
    return false;
  }

  return !EXCLUDED_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

function shouldPrerender(request: Request, hosts: string[]): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }

  const url = new URL(request.url);
  const userAgent = (request.headers.get("user-agent") ?? "").toLowerCase();
  const prerenderMarker = request.headers.get("x-prerender");
  const bufferAgent = request.headers.get("x-bufferbot");
  const extensionIndex = url.pathname.lastIndexOf(".");
  const extension =
    extensionIndex >= 0 ? url.pathname.slice(extensionIndex).toLowerCase() : "";

  if (prerenderMarker || bufferAgent) {
    return false;
  }

  if (hosts.length > 0 && !isOneOfThem(hosts, url.hostname.toLowerCase())) {
    return false;
  }

  if (extension && isOneOfThem(IGNORE_EXTENSIONS, extension)) {
    return false;
  }

  return containsOneOfThem(BOT_AGENTS, userAgent);
}

async function fetchPrerendered(request: Request, env: Env): Promise<Response> {
  const serviceUrl = (env.PRERENDER_SERVICE_URL || DEFAULT_SERVICE_URL).replace(/\/+$/, "");
  const prerenderUrl = `${serviceUrl}/${request.url}`;
  const headers = new Headers(request.headers);

  headers.set("X-Prerender-Token", env.PRERENDER_TOKEN);
  headers.set("X-Prerender", "1");

  const prerenderRequest = new Request(prerenderUrl, {
    method: request.method,
    headers,
    redirect: "manual",
  });

  return fetch(prerenderRequest, { cache: "no-store" });
}

function withStatus(response: Response, status: number, extraHeaders?: Record<string, string>): Response {
  const headers = new Headers(response.headers);

  Object.entries(extraHeaders ?? {}).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status,
    statusText: response.statusText,
    headers,
  });
}

async function fetchSpaFallback(request: Request): Promise<Response> {
  const fallbackUrl = new URL(SPA_FALLBACK_PATH, request.url);
  const fallbackRequest = new Request(fallbackUrl.toString(), {
    method: request.method,
    headers: request.headers,
    redirect: "manual",
  });

  const fallbackResponse = await fetch(fallbackRequest, { cache: "no-store" });

  if (!fallbackResponse.ok) {
    return fallbackResponse;
  }

  return withStatus(fallbackResponse, 200, {
    "x-spa-fallback": "1",
  });
}

async function fetchOriginWithSpaFallback(request: Request, hosts: string[]): Promise<Response> {
  const originResponse = await fetch(request);

  if (originResponse.status !== 404 || !isSpaRouteCandidate(request, hosts)) {
    return originResponse;
  }

  try {
    const fallbackResponse = await fetchSpaFallback(request);
    return fallbackResponse.ok ? fallbackResponse : originResponse;
  } catch {
    return originResponse;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const configuredHosts = normalizeHosts(env.PRERENDER_HOSTS);

    if (!env.PRERENDER_TOKEN) {
      return fetchOriginWithSpaFallback(request, configuredHosts);
    }

    if (!shouldPrerender(request, configuredHosts)) {
      return fetchOriginWithSpaFallback(request, configuredHosts);
    }

    try {
      const prerenderedResponse = await fetchPrerendered(request, env);

      if (prerenderedResponse.status === 404 && isSpaRouteCandidate(request, configuredHosts)) {
        return withStatus(prerenderedResponse, 200, {
          "x-prerender-spa-fallback": "1",
        });
      }

      return prerenderedResponse;
    } catch {
      return fetchOriginWithSpaFallback(request, configuredHosts);
    }
  },
};
