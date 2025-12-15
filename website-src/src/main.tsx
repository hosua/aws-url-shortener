import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { loadConfig } from "@lib/config";

const initApp = async () => {
  try {
    await loadConfig();
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, -apple-system, sans-serif;">
          <div style="text-align: center; padding: 2rem;">
            <h1 style="color: #ef4444; margin-bottom: 1rem;">Configuration Error</h1>
            <p style="color: #6b7280; margin-bottom: 0.5rem;">Failed to load application configuration.</p>
            <p style="color: #9ca3af; font-size: 0.875rem;">${error instanceof Error ? error.message : String(error)}</p>
          </div>
        </div>
      `;
    }
  }
};

initApp();
