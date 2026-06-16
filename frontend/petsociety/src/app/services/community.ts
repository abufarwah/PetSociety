import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {

  private apiUrl = 'https://localhost:44371/api';

  constructor(private http: HttpClient) {}

  getChannels(searchName: string = '') {
    let params = new HttpParams();
    
    if (searchName && searchName.trim() !== '') {
      params = params.set('Name', searchName.trim());
    }

    return this.http.get(`${this.apiUrl}/CommunityChannels/GetAll`, { params });
  }

  getMessages(channelId: number) {
    return this.http.get(`${this.apiUrl}/CommunityMessages/GetByChannel?ChannelId=${channelId}`);
  }

  sendMessage(channelId: number, messageText: string) {
    const token = localStorage.getItem('token');

    return this.http.post(
      `${this.apiUrl}/CommunityMessages/Add`,
      {
        channelId,
        messageText
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  editMessage(messageId: number, newMessageText: string) {
    const token = localStorage.getItem('token');

    return this.http.put(
      `${this.apiUrl}/CommunityMessages/Update`,
      {
        id: messageId,
        messageText: newMessageText
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  deleteMessage(messageId: number) {
    const token = localStorage.getItem('token');

    return this.http.delete(
      `${this.apiUrl}/CommunityMessages/Delete?id=${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  joinChannel(channelId: number) {
    const token = localStorage.getItem('token');

    return this.http.post(
      `${this.apiUrl}/CommunityChannels/Join?channelId=${channelId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  leaveChannel(channelId: number) {
    const token = localStorage.getItem('token');

    return this.http.post(
      `${this.apiUrl}/CommunityChannels/Leave?channelId=${channelId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
}