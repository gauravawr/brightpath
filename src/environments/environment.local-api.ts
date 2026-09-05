// Dev against a LOCALLY-RUNNING eApp backend. Only useful if you have the eApp
// solution and are running eApp.Api (:5001) and eApp.AuthServer2 (:5000) yourself.
//
// Frontend-only maintainers should NOT use this - plain `npm start` targets the
// deployed backend instead, which needs nothing running locally.
//   npm run start:local-api
export const environment = {
  production: false,
  enableAnalytics: false,
  excludedDomains: ['localhost', '127.0.0.1'],

  apiBaseUrl: 'http://localhost:5001',
  idServerEndpoint: 'https://localhost:5000',

  clientId: 'brightpath-spa',
  // Fakes a signed-in teacher so /teach is reachable without the auth server up.
  localhostAuthBypassEnabled: true,
  webAppEndpoint: 'http://localhost:4200/',

  blobImageBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/images',
  blobContentBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/brightpath',
  blobVideoBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/videos',

  gtmContainerId: '',
  amplitudeApiKey: '',
};
