// Local review mode: the Angular app uses deployed APIs but loads lesson files
// from scripts/serve-local-lessons.mjs on http://localhost:4300.
export const environment = {
  production: false,
  enableAnalytics: false,
  excludedDomains: ['localhost', '127.0.0.1'],
  apiBaseUrl: 'https://eshoppingapi.azurewebsites.net',
  idServerEndpoint: 'https://eshopauth.azurewebsites.net',
  clientId: 'brightpath-spa',
  localhostAuthBypassEnabled: false,
  webAppEndpoint: 'http://localhost:4200/',
  blobImageBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/images',
  blobContentBaseUrl: 'http://localhost:4300',
  blobVideoBaseUrl: 'https://eshoppingstorage.blob.core.windows.net/videos',
  gtmContainerId: '',
  amplitudeApiKey: '',
};
