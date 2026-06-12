import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PetService {

  private baseUrl = 'https://localhost:44371/api/Pets';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getPets(filters?: any) {
    let params = new HttpParams();

    if (filters) {
      if (filters.type) params = params.set('Type', filters.type);
      if (filters.age) params = params.set('AgeCategory', filters.age);
      if (filters.gender) params = params.set('Gender', filters.gender);
      if (filters.tag) params = params.set('Tag', filters.tag);
    }

    return this.http.get<any[]>(`${this.baseUrl}/GetAll`, { params });
  }

  getPetById(id: number) {
    return this.http.get(`${this.baseUrl}/GetById`, {
      params: { Id: id }
    });
  }

  addPet(formData: FormData) {
    return this.http.post(`${this.baseUrl}/Add`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  updatePet(formData: FormData) {
    return this.http.put(`${this.baseUrl}/Update`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  deletePet(id: number) {
    const params = new HttpParams().set('Id', id.toString());
    return this.http.delete(`${this.baseUrl}/Delete`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  updatePetStatus(id: number, status: string) {
  return this.http.put(`${this.baseUrl}/UpdateStatus`, {
    id,
    status
  }, {
    headers: this.getAuthHeaders(),
  });
}

}