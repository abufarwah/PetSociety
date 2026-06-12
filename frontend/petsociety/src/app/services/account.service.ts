import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { DashboardDto } from '../models/account.models';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly apiUrl = 'https://localhost:44371/api/account';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  getDashboard(): Observable<DashboardDto> {
    try {
      return this.http.get<DashboardDto>(`${this.apiUrl}/dashboard`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      return throwError(() => error);
    }
  }

  logout(): Observable<{ message: string }> {
    try {
      return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, {}, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      return throwError(() => error);
    }
  }
}
