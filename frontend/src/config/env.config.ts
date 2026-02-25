/**
 * Environment configuration
 * @description Centralized environment variable access with type safety
 */

interface EnvConfig {
  readonly apiBaseUrl: string;
  readonly wsBaseUrl: string;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
}

const getEnvVar = (key: string, defaultValue: string): string => {
  return import.meta.env[key] ?? defaultValue;
};

export const ENV: EnvConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000/api'),
  wsBaseUrl: getEnvVar('VITE_WS_BASE_URL', 'ws://localhost:3000'),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

