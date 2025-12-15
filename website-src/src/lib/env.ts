const metaEnv = import.meta.env;

export const API_BASE_URL = metaEnv.VITE_API_BASE_URL || "";
export const REGION = metaEnv.VITE_REGION || "";

export type ENV = "PROD" | "DEV";
export const getEnv = (): ENV => (metaEnv.PROD ? "PROD" : "DEV");
export const isProd = (): boolean => getEnv() === "PROD";
