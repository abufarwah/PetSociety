import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdoptionService {

  private baseUrl = 'https://localhost:44371/api/AdoptionRequests';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get(`${this.baseUrl}/GetAll`);
  }

  requestAdoption(data: any) {
  return this.http.post(`${this.baseUrl}/Add`, {
    petId: data.petId,
    phoneNumber: data.phoneNumber,
    deliveryMethod: data.deliveryMethod,
    userId: data.userId
  });
}

  updateRequest(data: any) {
    return this.http.put(`${this.baseUrl}/Update`, data);
  }

  deleteRequest(id: number) {
    return this.http.delete(`${this.baseUrl}/Delete`, {
      params: { Id: id }
    });
  }
  
}