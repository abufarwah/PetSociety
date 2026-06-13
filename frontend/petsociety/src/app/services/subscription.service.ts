// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';

// export interface ProcessPaymentResponse {
//   success: boolean;
//   message: string;
// }

// export interface SubscriptionStatusResponse {
//   isActive: boolean;
//   packageName?: string;
//   endDate?: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class SubscriptionService {
// private readonly apiUrl = 'https://localhost:44371/api/Subscription'; 
// // 👆 غيري الرقم 44371 للبورت الحقيقي تبع مشروع الـ .NET عندك
//   constructor(private http: HttpClient) {}

//   private getAuthHeaders(): HttpHeaders {
//   // 1. بنجيب التوكن المخزن بالمتصفح وقت ما اليوزر سجل دخول
//   const token = localStorage.getItem('token') || ''; 

//   // 2. بنرسلها بالطريقة اللي الباك إند بيفهمها ويموت عليها
//   return new HttpHeaders({
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${token}` // <--- هذا هو السطر السحري
//   });
// }

//   processPayment(paymentData: any): Observable<ProcessPaymentResponse> {
//   const headers = this.getAuthHeaders();

//   // تنظيف وإرسال الكائن بأحرف صغيرة (camelCase) لأن الـ .NET Web API يقرأها هكذا افتراضياً
//   const body = {
//     packageName: paymentData.packageName || paymentData.PackageName,
//     cardNumber: String(paymentData.cardNumber || '').replace(/\s/g, ''), // تنظيف صارم لأي فراغ
//     cardName: paymentData.cardName || paymentData.CardName,
//     expiry: paymentData.expiry || paymentData.Expiry,
//     cvv: String(paymentData.cvv || ''),
//     address: paymentData.address || paymentData.Address || '',
//     city: paymentData.city || paymentData.City || '',
//     postalCode: String(paymentData.postalCode || paymentData.PostalCode || '')
//   };

//   console.log('Sending Clean camelCase Body:', body);

//   return this.http.post<ProcessPaymentResponse>(
//     `${this.apiUrl}/process-payment`,
//     body, 
//     { headers }
//   );
// }

//   getMyStatus(): Observable<SubscriptionStatusResponse> {
//     try {
//       // const headers = this.getAuthHeaders();

//       return this.http.get<SubscriptionStatusResponse>(`${this.apiUrl}/my-status`, { headers });
//     } catch (error) {
//       return throwError(() => error);
//     }
//   }
// }



// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// export interface ProcessPaymentResponse {
//   success: boolean;
//   message: string;
// }

// export interface SubscriptionStatusResponse {
//   isActive: boolean;
//   packageName?: string;
//   endDate?: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class SubscriptionService {

//   private readonly apiUrl = 'https://localhost:44371/api/Subscription';

//   constructor(private http: HttpClient) {}

//   // 🔥 ملاحظة: حذفنا getAuthHeaders بالكامل لأن الـ Interceptor هو المسؤول عن التوكن

//   processPayment(paymentData: any): Observable<ProcessPaymentResponse> {

//     const body = {
//       packageName: paymentData.packageName || paymentData.PackageName,
//       cardNumber: String(paymentData.cardNumber || '').replace(/\s/g, ''),
//       cardName: paymentData.cardName || paymentData.CardName,
//       expiry: paymentData.expiry || paymentData.Expiry,
//       cvv: String(paymentData.cvv || ''),
//       address: paymentData.address || paymentData.Address || '',
//       city: paymentData.city || paymentData.City || '',
//       postalCode: String(paymentData.postalCode || paymentData.PostalCode || '')
//     };

//     console.log('Sending Payment Body:', body);

//     return this.http.post<ProcessPaymentResponse>(
//       `${this.apiUrl}/process-payment`,
//       body
//     );
//   }

//   getMyStatus(): Observable<SubscriptionStatusResponse> {
//     return this.http.get<SubscriptionStatusResponse>(
//       `${this.apiUrl}/my-status`
//     );
//   }
// }




import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProcessPaymentResponse {
  success: boolean;
  message: string;
}

export interface SubscriptionStatusResponse {
  isActive: boolean;
  packageName?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  // الروابط والمسارات متطابقة تماماً مع الـ Controller في الـ Backend
  private readonly apiUrl = 'https://localhost:44371/api/Subscription';

  constructor(private http: HttpClient) {}

  /**
   * إرسال بيانات الدفع وتفعيل الاشتراك
   * ملاحظة: الـ Interceptor هو المسؤول عن حقن ترويسة الـ Authorization تلقائياً.
   */
  processPayment(paymentData: any): Observable<ProcessPaymentResponse> {

    // تجهيز وتنظيف كائن البيانات للتأكد من إرساله بالأسماء المطلوبة (CamelCase) في الـ DTO
    const body = {
      packageName: paymentData.packageName || paymentData.PackageName,
      cardNumber: String(paymentData.cardNumber || '').replace(/\s/g, ''),
      cardName: paymentData.cardName || paymentData.CardName,
      expiry: paymentData.expiry || paymentData.Expiry,
      cvv: String(paymentData.cvv || ''),
      address: paymentData.address || paymentData.Address || '',
      city: paymentData.city || paymentData.City || '',
      postalCode: String(paymentData.postalCode || paymentData.PostalCode || '')
    };

    console.log('Sending Payment Body via Interceptor:', body);

    return this.http.post<ProcessPaymentResponse>(
      `${this.apiUrl}/process-payment`,
      body
    );
  }

  /**
   * جلب حالة اشتراك المستخدم الحالي
   */
  getMyStatus(): Observable<SubscriptionStatusResponse> {
    try {
      const headers = this.getAuthHeaders();

      return this.http.get<SubscriptionStatusResponse>(`${this.apiUrl}/my-status`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }
}