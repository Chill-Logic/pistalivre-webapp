import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { listenInstallPrompt } from "./helpers/pwa";
import { applyRealmManifest } from "./helpers/pwa-manifest";
import { applyTheme, readTheme } from "./helpers/theme";
import "@fontsource-variable/archivo/standard.css";
import "./index.css";

// Before the first paint, so a dark-theme user never sees a white flash.
applyTheme(readTheme());
// Before the browser offers to install, so it installs as this area's app.
applyRealmManifest();
// The install prompt fires once, early: keep it for the PWA invite.
listenInstallPrompt();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
