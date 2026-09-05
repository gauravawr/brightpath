// Default DEV environment: `npm start` runs the UI locally against the DEPLOYED
// backend, so no part of the eApp/YugTree solution needs to be running. This is
// the setup for maintaining BrightPath's frontend on its own.
//
// Sign-in works from localhost: the auth server has http://localhost:4200/signin-callback
// registered for the brightpath-spa client, and the API allows any origin.
// You need the 'teacher' role on your account to reach /teach.
//
// Replaced by environment.prod.ts for prod builds, and by environment.local-api.ts
// via `npm run start:local-api` (see angular.json fileReplacements).
export const environment = {
  production: false,
  // Off in dev on purpose: local page views must never reach the shared GTM container.
  enableAnalytics: false,
  excludedDomains: ['localhost', '127.0.0.1'],

  // Deployed shared eApp backend - nothing to run locally.
  apiBaseUrl: 'https://eshoppingapi.azurewebsites.net',
  idServerEndpoint: 'https://eshopauth.azurewebsites.net',

  clientId: 'brightpath-spa',
  // Real sign-in against the deployed auth server, so the roles you get locally
  // are the ones you actually have in production.
  localhostAuthBypassEnabled: false,
  webAppEndpoint: 'http://localhost:4200/',

  blobImageBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/images',
  blobContentBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/brightpath',
  blobVideoBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/videos',

  gtmContainerId: '',
  amplitudeApiKey: '',
};
