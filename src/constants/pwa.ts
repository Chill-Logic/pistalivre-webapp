/**
 * The installed app's name on each area's domain. One build serves all, so
 * the build emits one manifest per area (vite.config) and the app points the
 * page at the right one (helpers/pwa-manifest). Read by vite.config too: no
 * "@/" imports here.
 */
export const PWA_REALM_APPS = {
  gestao: {
    manifest: "/manifest-gestao.webmanifest",
    name: "Pista Livre Gestão",
    shortName: "PL Gestão",
  },
  cliente: {
    manifest: "/manifest-cliente.webmanifest",
    name: "Pista Livre: Área do Cliente",
    shortName: "PL Cliente",
  },
  /** Only names the bookmark/home icon: the partner area has no invite. */
  parceiro: {
    manifest: "/manifest-parceiro.webmanifest",
    name: "Pista Livre Parceiro",
    shortName: "PL Parceiro",
  },
} as const;
