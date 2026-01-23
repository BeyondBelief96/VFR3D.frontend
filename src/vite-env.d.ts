/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_AUTH0_REDIRECT_URI: string;
  readonly VITE_AUTH0_LOGOUT_URI: string;
  readonly VITE_AUTH0_VFR3D_API_AUDIENCE: string;
  readonly VITE_VFR3D_BASE_URL: string;
  readonly VITE_CESIUM_API_KEY: string;
  readonly VITE_ARCGIS_API_KEY: string;
  readonly VITE_FAA_ARCGIS_BASE_URL: string;
  readonly VITE_EMAILJS_USER_ID: string;
  readonly VITE_EMAILJS_VFR3D_EMAIL_SERVICE_ID: string;
  readonly VITE_EMAILJS_CONTACT_FORM_TEMPLATE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
