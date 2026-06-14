import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LostFoundService {
  private readonly apiUrl = 'https://localhost:44371/api/LostFoundReports';

  constructor(private http: HttpClient) {}

  getReports(options?: {
    type?: string;
    petType?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    let params = new HttpParams();

    if (options) {
      if (options.type) params = params.set('type', options.type);
      if (options.petType) params = params.set('petType', options.petType);
      if (options.status) params = params.set('status', options.status);
      if (options.search) params = params.set('search', options.search);
      if (options.page) params = params.set('page', options.page.toString());
      if (options.pageSize) params = params.set('pageSize', options.pageSize.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/reports`, { params });
  }

  createReport(formData: FormData) {
    return this.http.post(`${this.apiUrl}/reports`, formData);
  }

  updateReport(id: number, formData: FormData) {
    return this.http.put(`${this.apiUrl}/reports/${id}`, formData);
  }

  deleteReport(id: number) {
    return this.http.delete(`${this.apiUrl}/reports/${id}`);
  }
}
