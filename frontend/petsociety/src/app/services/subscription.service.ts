import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

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
  private readonly apiUrl = '/api/subscription';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Missing auth token');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  processPayment(packageName: string): Observable<ProcessPaymentResponse> {
    try {
      const headers = this.getAuthHeaders();
      const body = { packageName };

      return this.http.post<ProcessPaymentResponse>(`${this.apiUrl}/process-payment`, body, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  getMyStatus(): Observable<SubscriptionStatusResponse> {
    try {
      const headers = this.getAuthHeaders();

      return this.http.get<SubscriptionStatusResponse>(`${this.apiUrl}/my-status`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }
}