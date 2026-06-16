// import { Injectable } from '@angular/core';
// import {
//   HttpInterceptor,
//   HttpRequest,
//   HttpHandler,
//   HttpEvent
// } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

//     const token = localStorage.getItem('token');

//     if (token) {
//   req = req.clone({
//     setHeaders: {
//       Authorization: `Bearer ${token}`
//     }
//   });
// }

// return next.handle(req);

//     return next.handle(req);
//   }
// }

// import { Injectable } from '@angular/core';
// import {
//   HttpInterceptor,
//   HttpRequest,
//   HttpHandler,
//   HttpEvent
// } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     // 1. جلب التوكن من الـ LocalStorage
//     const token = localStorage.getItem('token');

//     if (token) {
//       // 2. تنظيف التوكن من أي علامات اقتباس زائدة ("") قد تضاف تلقائياً أثناء الحفظ
//       const cleanToken = token.replace(/^"(.*)"$/, '$1');

//       // 3. عمل نسخة من الطلب وحقن التوكن النظيف في الـ Headers
//       req = req.clone({
//         setHeaders: {
//           Authorization: `Bearer ${cleanToken}`
//         }
//       });
//     }

//     // 4. تمرير الطلب المعدل إلى الخطوة التالية (الباك إيند)
//     return next.handle(req);
//   }
// }

import { HttpInterceptorFn } from '@angular/common/http';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. جلب التوكن من الـ LocalStorage
  const token = localStorage.getItem('token');
  console.log('--- AuthInterceptor triggered! ---');
  if (token) {
    // 2. تنظيف التوكن من علامات الاقتباس الزائدة ""
    const cleanToken = token.replace(/^"(.*)"$/, '$1');
    console.log('Injecting clean token into headers...');
    // 3. عمل نسخة من الطلب وحقن ترويسة المصادقة
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${cleanToken}`
      }
    });
  } else {
    console.warn('No token found in localStorage!');
  }
  // 4. تمرير الطلب للباك إيند
  return next(req);
}; 