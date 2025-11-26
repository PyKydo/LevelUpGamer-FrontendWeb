import axios from "axios";
import { getLocalStorageItem, removeLocalStorageItem } from "./storage.helper";

const API_VERSION_PATH = "api/v1/";
const PRIMARY_API_HOST =
  "https://overintense-frederic-unpercipient.ngrok-free.dev";
const SECONDARY_API_HOST = "http://98.89.104.110:8081";

const ensureTrailingSlash = (value: string): string =>
  value.endsWith("/") ? value : `${value}/`;

const buildBaseUrl = (host: string): string =>
  `${ensureTrailingSlash(host)}${API_VERSION_PATH}`;

const deriveRootUrl = (baseUrl: string): string =>
  baseUrl.replace(/\/api\/v1\/?$/, "/");

export const API_BASE_URLS = Object.freeze([
  buildBaseUrl(PRIMARY_API_HOST),
  buildBaseUrl(SECONDARY_API_HOST),
]);

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
