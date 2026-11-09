import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { applyRealmManifest } from "./helpers/pwa-manifest";
import { applyTheme, readTheme } from "./helpers/theme";
import "./index.css";

// Before the first paint, so a dark-theme user never sees a white flash.
applyTheme(readTheme());
// Before the browser offers to install, so it installs as this area's app.
applyRealmManifest();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
