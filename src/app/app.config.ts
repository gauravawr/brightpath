import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { LanguageService } from './core/services/language.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withComponentInputBinding(),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),

    // i18n (ngx-translate v17 provider API)
    provideTranslateService({ fallbackLang: 'en' }),
    provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),

    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      const lang = inject(LanguageService);
      const active = lang.resolve();
      translate.addLangs([...lang.supported]);
      translate.use(active);
      lang.setCurrent(active);
    }),
  ],
};
