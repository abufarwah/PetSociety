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

  private readonly apiUrl = 'http://localhost:5290/api/Subscription';

  constructor(private http: HttpClient) {}

  /**
   * إرسال بيانات الدفع وتفعيل الاشتراك
   * الـ Interceptor يحقن Authorization header تلقائياً
   */
  processPayment(paymentData: any): Observable<ProcessPaymentResponse> {
    const body = {
      packageName: paymentData.packageName || paymentData.PackageName,
      cardNumber:  String(paymentData.cardNumber || '').replace(/\s/g, ''),
      cardName:    paymentData.cardName  || paymentData.CardName,
      expiry:      paymentData.expiry    || paymentData.Expiry,
      cvv:         String(paymentData.cvv || ''),
      address:     paymentData.address   || paymentData.Address   || '',
      city:        paymentData.city      || paymentData.City      || '',
      postalCode:  String(paymentData.postalCode || paymentData.PostalCode || '')
    };

    return this.http.post<ProcessPaymentResponse>(
      `${this.apiUrl}/process-payment`,
      body
    );
  }

  /**
   * جلب حالة اشتراك المستخدم الحالي
   * GET /api/Subscription/my-status
   */
  getMyStatus(): Observable<SubscriptionStatusResponse> {
    return this.http.get<SubscriptionStatusResponse>(`${this.apiUrl}/my-status`);
  }
}