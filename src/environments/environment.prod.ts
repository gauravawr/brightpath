export const environment = {
  production: true,
  enableAnalytics: true,
  excludedDomains: ['localhost', '127.0.0.1'],

  // Shared eApp backend (production)
  apiBaseUrl: 'https://eshoppingapi.azurewebsites.net',
  idServerEndpoint: 'https://eshopauth.azurewebsites.net',

  clientId: 'brightpath-spa',
  localhostAuthBypassEnabled: false,
  webAppEndpoint: 'https://calm-tree-0f5893110.3.azurestaticapps.net/',

  blobImageBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/images',
  blobVideoBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/videos',

  // Shared YugTree/eApp GTM container (as agreed: BrightPath reuses YugTree analytics).
  // Swap for a BrightPath-only container if the traffic ever needs separating.
  gtmContainerId: 'GTM-5228QGVV',
  amplitudeApiKey: '',
};
