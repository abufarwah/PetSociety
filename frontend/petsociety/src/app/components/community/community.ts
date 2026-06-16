import {
  Component,
  OnInit,
  AfterViewChecked,
  ElementRef,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../services/community';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community.html',
  styleUrls: ['./community.css'],
})
export class Community implements OnInit, AfterViewChecked {

  @ViewChild('scrollContainer') private myScrollContainer!: ElementRef;

  constructor(
    private communityService: CommunityService,
    private cdr: ChangeDetectorRef
  ) {}

  searchQuery: string = '';
  newMessage: string = '';
  channels: any[] = [];
  messages: any[] = [];
  activeChannel: any = null;
  currentUserId: any = this.getUserIdFromToken();

  ngOnInit(): void {
    this.loadChannels();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  get filteredChannels() {
    if (!this.searchQuery.trim()) {
      return this.channels;
    }
    return this.channels.filter(channel => 
      channel.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      channel.description?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  loadChannels() {
    this.communityService.getChannels().subscribe({
      next: (res: any) => {
        this.channels = res?.data ?? res ?? [];

        if (!Array.isArray(this.channels)) {
          console.error('Channels is not array', this.channels);
          this.channels = [];
          return;
        }

        if (this.channels.length === 0) return;

        const savedId = localStorage.getItem('activeChannelId');
        const channel = this.channels.find(c => c.id == savedId) || this.channels[0];

        this.setActiveChannel(channel);
        this.moveChannelToTop(channel.id);

        setTimeout(() => {
          this.cdr.detectChanges();
        });
      },
      error: err => console.log(err)
    });
  }

  setActiveChannel(channel: any) {
    if (!channel?.id) return;

    this.activeChannel = channel;
    localStorage.setItem('activeChannelId', channel.id);
    this.messages = [];

    setTimeout(() => {
      this.loadMessages(channel.id);
    }, 0);
  }

  loadMessages(channelId: number) {
    if (!channelId) {
      console.warn('NO CHANNEL ID');
      return;
    }

    this.messages = [];
    console.log('LOADING MESSAGES FOR:', channelId);

    this.communityService.getMessages(channelId).subscribe({
      next: (res: any) => {
        console.log('MESSAGES RESPONSE:', res);
        this.messages = Array.isArray(res) ? res : (res?.data ?? []);
        this.cdr.detectChanges();
      },
      error: err => {
        console.log('MESSAGES ERROR:', err);
      }
    });
  }

  selectChannel(channel: any) {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/signup';
      return;
    }

    this.moveChannelToTop(channel.id);

    if (this.activeChannel?.id === channel.id) {
      this.loadMessages(channel.id);
      return;
    }

    this.setActiveChannel(channel);
  }

  sendMessage() {
    if (!this.activeChannel?.isJoined) {
      alert('Please join the channel first');
      return;
    }

    const text = this.newMessage.trim();
    if (!text) return;

    this.newMessage = '';

    const tempMsg = {
      messageText: text,
      userId: this.currentUserId,
      userName: 'You',
      sentAt: new Date()
    };

    this.messages = [...this.messages, tempMsg];
    this.scrollToBottom();
    
    this.moveChannelToTop(this.activeChannel.id);

    this.communityService.sendMessage(this.activeChannel.id, text).subscribe({
      next: (res: any) => {
        if (res && !res.userId) {
          res.userId = this.currentUserId;
        }

        this.messages = this.messages.map(m =>
          m === tempMsg ? res : m
        );
        this.cdr.detectChanges();
      },
      error: err => {
        console.log(err);
        this.messages = this.messages.filter(m => m !== tempMsg);
      }
    });
  }

  joinChannel() {
    if (!this.activeChannel) return;

    this.communityService.joinChannel(this.activeChannel.id).subscribe({
      next: () => {
        this.activeChannel.isJoined = true;
        this.activeChannel.membersCount++;
        this.moveChannelToTop(this.activeChannel.id);
        this.cdr.detectChanges();
      },
      error: err => console.log(err)
    });
  }

  leaveChannel() {
    if (!this.activeChannel) return;
    
    if (confirm(`Are you sure you want to leave ${this.activeChannel.name}?`)) {
      this.communityService.leaveChannel(this.activeChannel.id).subscribe({
        next: () => {
          this.activeChannel.isJoined = false;
          if (this.activeChannel.membersCount > 0) {
            this.activeChannel.membersCount--;
          }
          this.cdr.detectChanges();
        },
        error: err => {
          console.log('Error leaving channel:', err);
          this.activeChannel.isJoined = false;
          if (this.activeChannel.membersCount > 0) this.activeChannel.membersCount--;
          this.cdr.detectChanges();
        }
      });
    }
  }

  getUserIdFromToken(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nameid || payload.sub || payload.Id || payload.id || payload.userId || null;
    } catch {
      return null;
    }
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop =
        this.myScrollContainer.nativeElement.scrollHeight;
    } catch {}
  }

  isMine(msg: any): boolean {
    if (!msg || !this.currentUserId) return false;
    
    const msgUserId = msg.userId || msg.userIdHex || msg.user?.id || msg.id;
    if (!msgUserId) return false;

    return String(msgUserId).trim().toLowerCase() === String(this.currentUserId).trim().toLowerCase();
  }

  getAvatar(msg: any): string {
    const name = this.isMine(msg) ? 'You' : msg.userName;
    if (!name) return '?';

    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  }

  private moveChannelToTop(channelId: number) {
    if (!this.channels || this.channels.length <= 1) return;
    
    const targetIndex = this.channels.findIndex(c => c.id === channelId);
    if (targetIndex > 0) {
      const [targetChannel] = this.channels.splice(targetIndex, 1);
      this.channels = [targetChannel, ...this.channels];
    }
  }
}