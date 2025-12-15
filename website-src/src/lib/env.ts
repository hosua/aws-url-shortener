import { getConfig } from "./config";

export const API_BASE_URL = (): string => getConfig().apiBaseUrl;
export const REGION = (): string => getConfig().region;

export type ENV = "PROD" | "DEV";
export const getEnv = (): ENV => {
  const metaEnv = import.meta.env;
  return metaEnv.PROD ? "PROD" : "DEV";
};
export const isProd = (): boolean => getEnv() === "PROD";
