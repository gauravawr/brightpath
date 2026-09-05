export const environment = {
  production: true,
  enableAnalytics: true,
  excludedDomains: ['localhost', '127.0.0.1'],

  // Shared eApp backend (production)
  apiBaseUrl: 'https://eshoppingapi.azurewebsites.net',
  idServerEndpoint: 'https://eapp-auth.azurewebsites.net',

  clientId: 'brightpath-spa',
  localhostAuthBypassEnabled: false,
  webAppEndpoint: 'https://brightpath.app/',

  blobImageBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/images',
  blobVideoBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/videos',

  // TODO: set BrightPath's own GTM container id before launch
  gtmContainerId: '',
  amplitudeApiKey: '',
};
