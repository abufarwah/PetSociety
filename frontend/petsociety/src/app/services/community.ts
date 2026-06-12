import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {

  private apiUrl = 'https://localhost:44371/api';

  constructor(private http: HttpClient) {}

  // // ======================
// GET CHANNELS
// ======================
getChannels(searchName: string = '') {
  let params = new HttpParams();
  
  // التعديل المهم: فقط إذا كان النص يحتوي على حروف فعلياً نقوم بإرساله
  if (searchName && searchName.trim() !== '') {
    params = params.set('Name', searchName.trim());
  }

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