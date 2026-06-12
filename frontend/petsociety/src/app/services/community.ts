import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {

  private apiUrl = 'https://localhost:44371/api';

  constructor(private http: HttpClient) {}

  // ======================
  // GET CHANNELS
  // ======================
  // أضفنا متغير searchName عشان يستقبل نص البحث من الـ Component
  getChannels(searchName: string = '') {
    let params = new HttpParams();
    
    if (searchName) {
      params = params.set('Name', searchName);
    }

    // شلنا الـ getAuthHeaders() لأن الـ Interceptor بيقوم بالواجب تلقائياً
    return this.http.get(`${this.apiUrl}/CommunityChannels/GetAll`, { params });
  }

  // ======================
  // GET MESSAGES
  // ======================
  getMessages(channelId: number) {
    // شلنا الـ getAuthHeaders()
    return this.http.get(`${this.apiUrl}/CommunityMessages/GetByChannel?ChannelId=${channelId}`);
  }

  // ======================
  // SEND MESSAGE
  // ======================
  sendMessage(channelId: number, messageText: string) {
    // شلنا الـ getAuthHeaders()
    return this.http.post(`${this.apiUrl}/CommunityMessages/Add`, {
      channelId,
      messageText
    });
  }
}