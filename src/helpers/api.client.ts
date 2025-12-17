import axios from "axios";
import { getLocalStorageItem, removeLocalStorageItem } from "./storage.helper";

const API_VERSION_PATH = "api/v1/";
const DEFAULT_PRIMARY_API_HOST =
  "https://overintense-frederic-unpercipient.ngrok-free.dev";
const DEFAULT_SECONDARY_API_HOST = "http://98.89.104.110:8081";
const DEFAULT_LOCAL_API_HOST = "http://localhost:8080";

type EnvRecord = Record<string, string | boolean | undefined>;
export type ApiEnvironment = "local" | "production";

const importMetaEnv: EnvRecord = (
  typeof import.meta !== "undefined" && import.meta.env
    ? (import.meta.env as EnvRecord)
    : {}
) as EnvRecord;

const readEnvString = (key: string, fallback = ""): string => {
  const fromImportMeta = importMetaEnv?.[key];
  if (typeof fromImportMeta === "string" && fromImportMeta.trim().length > 0) {
    return fromImportMeta.trim();
  }
  return fallback;
};

const normalizeHost = (host?: string): string | null => {
  if (!host?.trim()) {
    return null;
  }
  return host.trim().replace(/\/+$/, "");
};

const normalizeEnvironment = (value?: string): ApiEnvironment | null => {
  if (!value?.trim()) {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (["local", "development", "dev", "test"].includes(normalized)) {
    return "local";
  }
  if (["production", "prod"].includes(normalized)) {
    return "production";
  }
  return null;
};

const ensureTrailingSlash = (value: string): string =>
  value.endsWith("/") ? value : `${value}/`;

const buildBaseUrl = (host: string): string =>
  `${ensureTrailingSlash(host)}${API_VERSION_PATH}`;

const deriveRootUrl = (baseUrl: string): string =>
  baseUrl.replace(/\/api\/v1\/?$/, "/");

const primaryHost =
  normalizeHost(
    readEnvString("VITE_API_PRIMARY_HOST", DEFAULT_PRIMARY_API_HOST)
  ) ?? DEFAULT_PRIMARY_API_HOST;
const secondaryHost = normalizeHost(
  readEnvString("VITE_API_SECONDARY_HOST", DEFAULT_SECONDARY_API_HOST)
);
const localHost =
  normalizeHost(readEnvString("VITE_API_LOCAL_HOST", DEFAULT_LOCAL_API_HOST)) ??
  DEFAULT_LOCAL_API_HOST;

const explicitEnv = normalizeEnvironment(readEnvString("VITE_API_ENV"));
const nodeEnv = normalizeEnvironment(readEnvString("NODE_ENV"));
const modeEnv = normalizeEnvironment(readEnvString("MODE"));
const resolvedApiEnvironment: ApiEnvironment =
  explicitEnv ??
  (Boolean(importMetaEnv?.DEV) || nodeEnv === "local" || modeEnv === "local"
    ? "local"
    : "production");

const prioritizedHosts =
  resolvedApiEnvironment === "local"
    ? [localHost, primaryHost, secondaryHost]
    : [primaryHost, secondaryHost];

const API_HOSTS = Array.from(
  new Set(prioritizedHosts.filter((host): host is string => Boolean(host)))
);

export const API_BASE_URLS = Object.freeze(API_HOSTS.map(buildBaseUrl));
export const getApiEnvironment = (): ApiEnvironment => resolvedApiEnvironment;

let activeBaseIndex = 0;
let activeBaseUrl = API_BASE_URLS[activeBaseIndex];
let activeRootUrl = deriveRootUrl(activeBaseUrl);

const updateActiveBaseUrl = (nextIndex: number): void => {
  activeBaseIndex = nextIndex;
  activeBaseUrl = API_BASE_URLS[activeBaseIndex];
  activeRootUrl = deriveRootUrl(activeBaseUrl);
  apiClient.defaults.baseURL = activeBaseUrl;
};

export const getActiveApiBaseUrl = (): string => activeBaseUrl;
export const getActiveApiRootUrl = (): string => activeRootUrl;

export const resetActiveApiBaseUrl = (): void => {
  updateActiveBaseUrl(0);
};

export const apiClient = axios.create({
  baseURL: activeBaseUrl,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

export const resolveApiUrl = (path: string): string => {
  if (!path) {
    return "";
  }

  try {
    const url = new URL(path);
    return url.toString();
  } catch {
    return new URL(path, getActiveApiRootUrl()).toString();
  }
};
apiClient.interceptors.request.use(
  (config) => {
    const token = getLocalStorageItem<string>("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const FALLBACK_FLAG = "__retriedWithSecondary";
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config as typeof error.config & {
      [FALLBACK_FLAG]?: boolean;
    };

    const shouldRetryWithFallback =
      !error.response &&
      activeBaseIndex === 0 &&
      API_BASE_URLS.length > 1 &&
      originalConfig &&
      !originalConfig?.[FALLBACK_FLAG];

    if (shouldRetryWithFallback) {
      originalConfig[FALLBACK_FLAG] = true;
      updateActiveBaseUrl(1);
      originalConfig.baseURL = getActiveApiBaseUrl();
      return apiClient(originalConfig);
    }

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      removeLocalStorageItem("token");
      removeLocalStorageItem("currentUser");
    }

    return Promise.reject(error);
  }
);
