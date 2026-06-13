// import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
// import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { provideRouter, withInMemoryScrolling } from '@angular/router';

// import { AuthInterceptor } from './interceptors/auth-interceptor';
// import { routes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),

//     provideHttpClient(),

//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: AuthInterceptor,
//       multi: true
//     },

//     provideRouter(
//       routes,
//       withInMemoryScrolling({
//         scrollPositionRestoration: 'top',
//         anchorScrolling: 'enabled'
//       })
//     )
//   ]
// };



// import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
// import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http'; // 👈 تم استيراد الدالة هنا لربط الـ Interceptor
// import { provideRouter, withInMemoryScrolling } from '@angular/router';

// import { authInterceptor } from './interceptors/auth-interceptor';
// import { routes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),

//     // 💡 التعديل الجوهري هنا: جعل عميل الـ HTTP يمر عبر الـ Interceptor الكلاسيكي (DI)
//     provideHttpClient(
//       withInterceptorsFromDi()
//     ),

//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: AuthInterceptor,
//       multi: true
//     },

//     provideRouter(
//       routes,
//       withInMemoryScrolling({
//         scrollPositionRestoration: 'top',
//         anchorScrolling: 'enabled'
//       })
//     )
//   ]
// };

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // 👈 لاحظ استخدام withInterceptors
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { authInterceptor } from './interceptors/auth-interceptor'; // 👈 استيراد الدالة الجديدة (بحروف صغيرة)
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // 💡 الربط الصحيح والأحدث لـ Angular المدعوم برومياً ومباشرة
    provideHttpClient(
      withInterceptors([authInterceptor]) // 👈 حقن دالة الانترسيبتور هنا مباشرة
    ),

    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    )
  ]
};