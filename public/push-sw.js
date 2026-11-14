/* Push notifications, imported by the generated service worker (vite.config.ts,
 * workbox.importScripts). The payload is {title, body, url, tag} from the API.
 * Tapping a notice focuses an open tab of the app and navigates it to the
 * screen, or opens a new one. Plain JS: this file is served as-is. */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Pista Livre", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Pista Livre";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      tag: data.tag,
      icon: "/pwa-192x192.png",
      badge: "/pwa-64x64.png",
      data: { url: data.url || "/" },
    }),
  );
});

/** The server writes the area prefix (/gestao/…); on the area's own domain it goes. */
function appPath(url) {
  const host = self.location.hostname;
  if (/(^|\.)gestao\./.test(host) && url.indexOf("/gestao") === 0) {
    return url.slice("/gestao".length) || "/";
  }
  return url;
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(appPath(event.notification.data?.url || "/"), self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          return client.focus().then((focused) => (focused && "navigate" in focused ? focused.navigate(target) : null));
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
