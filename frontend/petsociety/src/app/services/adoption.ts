import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdoptionService {

  private baseUrl = 'https://localhost:44371/api/AdoptionRequests';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  getAll() {
    return this.http.get(`${this.baseUrl}/GetAll`, {
      headers: this.getAuthHeaders(),
    });
  }

  requestAdoption(data: any) {
    return this.http.post(`${this.baseUrl}/Add`, {
      petId: data.petId,
      phoneNumber: data.phoneNumber,
      deliveryMethod: data.deliveryMethod,
      userEmail: data.userEmail
    }, {
      headers: this.getAuthHeaders(),
    });
  }

  updateRequest(data: any) {
    return this.http.put(`${this.baseUrl}/Update`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteRequest(id: number) {
    return this.http.delete(`${this.baseUrl}/Delete`, {
      headers: this.getAuthHeaders(),
      params: { Id: id }
    });
  }
  
}