/// <reference types="vite/client" />

/** major.minor.patch of the app (package.json). */
declare const __APP_VERSION__: string;
/** Short sha of the build (vite.config `define`). */
declare const __APP_COMMIT__: string;
/** When this build was made (ISO). */
declare const __APP_BUILT_AT__: string;
