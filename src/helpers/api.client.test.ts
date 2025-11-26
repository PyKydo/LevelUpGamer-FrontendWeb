import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./storage.helper', () => ({
  getLocalStorageItem: vi.fn(),
  removeLocalStorageItem: vi.fn(),
}));

import {
  apiClient,
  resolveApiUrl,
  getActiveApiBaseUrl,
  getActiveApiRootUrl,
  API_BASE_URLS,
  resetActiveApiBaseUrl,
} from './api.client';
import { getLocalStorageItem, removeLocalStorageItem } from './storage.helper';

type AdapterConfig = InternalAxiosRequestConfig<unknown>;

const buildResponse = (
  config: AdapterConfig,
  overrides: Partial<AxiosResponse> = {}
): AxiosResponse => ({
  data: overrides.data ?? {},
  status: overrides.status ?? 200,
  statusText: overrides.statusText ?? 'OK',
  headers: overrides.headers ?? {},
  config,
  request: overrides.request ?? {},
});

describe('api.client helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetActiveApiBaseUrl();
  });

  it('resolveApiUrl devuelve una cadena vacía cuando no hay ruta', () => {
    expect(resolveApiUrl('')).toBe('');
  });

  it('resolveApiUrl retorna la misma URL cuando ya es absoluta', () => {
    const absolute = 'https://cdn.levelup.cl/assets/logo.png';
    expect(resolveApiUrl(absolute)).toBe(absolute);
  });

  it('resolveApiUrl compone rutas relativas usando el host activo', () => {
    const relativePath = 'products/list';
    const expectedUrl = `${getActiveApiRootUrl()}${relativePath}`;
    expect(resolveApiUrl(relativePath)).toBe(expectedUrl);
  });

  it('agrega el token Bearer a los requests cuando existe en storage', async () => {
    vi.mocked(getLocalStorageItem).mockReturnValueOnce('test-token');

    const adapter = vi.fn(async (config: AdapterConfig) => buildResponse(config));

    await apiClient.get('/secure-endpoint', { adapter });

    const adapterConfig = adapter.mock.calls[0][0];
    expect(adapterConfig.headers?.Authorization).toBe('Bearer test-token');
  });

  it('limpia los datos de autenticación cuando la API responde 401', async () => {
    const adapter = vi.fn((config: AdapterConfig) => {
      const authError = new Error('Auth');
      return Promise.reject(
        Object.assign(authError, {
          config,
          response: {
            status: 401,
            statusText: 'Unauthorized',
            headers: {},
            data: {},
          },
        })
      );
    });

    await expect(apiClient.get('/secure-endpoint', { adapter })).rejects.toThrow('Auth');

    expect(removeLocalStorageItem).toHaveBeenCalledWith('token');
    expect(removeLocalStorageItem).toHaveBeenCalledWith('currentUser');
  });

  it('cambia dinámicamente al host secundario cuando ocurre un error de red', async () => {
    if (API_BASE_URLS.length < 2) {
      expect(API_BASE_URLS.length).toBeGreaterThan(1);
      return;
    }

    resetActiveApiBaseUrl();
    expect(getActiveApiBaseUrl()).toBe(API_BASE_URLS[0]);

    const attemptedBaseUrls: Array<string | undefined> = [];

    const adapter = vi
      .fn<(config: AdapterConfig) => Promise<AxiosResponse>>()
      .mockImplementationOnce((config) => {
        attemptedBaseUrls.push(config.baseURL);
        const networkError = new Error('Network');
        return Promise.reject(Object.assign(networkError, { config }));
      })
      .mockImplementationOnce((config) => {
        attemptedBaseUrls.push(config.baseURL);
        return Promise.resolve(buildResponse(config));
      });

    const response = await apiClient.get('/health', { adapter });

    expect(adapter).toHaveBeenCalledTimes(2);
    expect(attemptedBaseUrls).toEqual([API_BASE_URLS[0], API_BASE_URLS[1]]);
    expect(getActiveApiBaseUrl()).toBe(API_BASE_URLS[1]);
    expect(response.config.baseURL).toBe(API_BASE_URLS[1]);
  });
});
