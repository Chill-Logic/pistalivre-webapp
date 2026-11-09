import { PWA_REALM_APPS } from "@/constants/pwa";
import { hostRealm } from "@/helpers/host-realm";

/**
 * On an area's own domain, installs as that area's app ("Pista Livre Gestão",
 * "Pista Livre: Área do Cliente"): swaps the manifest link and the iPhone's
 * home-screen title. Hosts that serve both areas keep the generic one.
 */
export function applyRealmManifest() {
  const realm = hostRealm();
  if (!realm) return;
  const app = PWA_REALM_APPS[realm];
  document
    .querySelector<HTMLLinkElement>('link[rel="manifest"]')
    ?.setAttribute("href", app.manifest);
  document
    .querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]')
    ?.setAttribute("content", app.name);
}
