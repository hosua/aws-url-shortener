interface AppConfig {
  apiBaseUrl: string;
  region: string;
}

let configCache: AppConfig | null = null;

export const loadConfig = async (): Promise<AppConfig> => {
  if (configCache) {
    return configCache;
  }

  try {
    const response = await fetch("/config.json");
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`);
    }
    const config: AppConfig = await response.json();
    configCache = config;
    return config;
  } catch (error) {
    throw new Error(
      `Failed to load application configuration: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getConfig = (): AppConfig => {
  if (!configCache) {
    throw new Error("Configuration not loaded. Call loadConfig() first.");
  }
  return configCache;
};
