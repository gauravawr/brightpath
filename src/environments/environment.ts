// Dev environment. Replaced by environment.prod.ts in prod builds (see angular.json fileReplacements).
// BrightPath reuses the shared eApp/YugTree backend (API, auth server, blob storage).
export const environment = {
  production: false,
  enableAnalytics: false,
  excludedDomains: ['localhost', '127.0.0.1'],

  // Shared eApp backend
  apiBaseUrl: 'http://localhost:5001',
  idServerEndpoint: 'https://localhost:5000',

  // BrightPath OIDC SPA client (registered in eApp.AuthServer2)
  clientId: 'brightpath-spa',
  localhostAuthBypassEnabled: true,
  webAppEndpoint: 'http://localhost:4200/',

  // Shared blob storage; BrightPath assets live under the 'brightpath' prefix
  blobImageBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/images',
  blobContentBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/brightpath',
  blobVideoBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/videos',

  // Analytics (GTM shared container; disabled on localhost)
  gtmContainerId: '',
  amplitudeApiKey: '',
};
