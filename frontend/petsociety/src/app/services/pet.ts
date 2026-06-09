import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PetService {

  private baseUrl = 'https://localhost:44371/api/Pets';

  constructor(private http: HttpClient) {}

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
    return this.http.post(`${this.baseUrl}/Add`, formData);
  }

  updatePet(formData: FormData) {
    return this.http.put(`${this.baseUrl}/Update`, formData);
  }

  deletePet(id: number) {
    const params = new HttpParams().set('Id', id.toString());
    return this.http.delete(`${this.baseUrl}/Delete`, { params });
  }

  updatePetStatus(id: number, status: string) {
  return this.http.put(`${this.baseUrl}/UpdateStatus`, {
    id,
    status
  });
}

}