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

  // ======================
  // DATA
  // ======================
  newMessage: string = '';

  channels: any[] = [];
  messages: any[] = [];

  activeChannel: any = null;

  currentUserId: number = this.getUserIdFromToken();

  // ======================
  // INIT
  // ======================
  ngOnInit(): void {
    this.loadChannels();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // ======================
  // LOAD CHANNELS
  // ======================
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

      const channel =
        this.channels.find(c => c.id == savedId) ||
        this.channels[0];

      this.setActiveChannel(channel);

      setTimeout(() => {
        this.cdr.detectChanges();
      });

    },
    error: err => console.log(err)
  });
}

  // ======================
  // CORE FUNCTION (FIXED)
  // ======================
 setActiveChannel(channel: any) {
  if (!channel?.id) return;

  this.activeChannel = channel;

  localStorage.setItem('activeChannelId', channel.id);

  // 🔥 مهم جداً: reset قبل الطلب
  this.messages = [];

  // 🔥 تأخير صغير لضمان Angular يلحق يحدّث state
  setTimeout(() => {
    this.loadMessages(channel.id);
  }, 0);
}

  // ======================
  // LOAD MESSAGES (FIXED)
  // ======================
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

      // 🔥 أهم سطر
      this.messages = Array.isArray(res) ? res : (res?.data ?? []);

      this.cdr.detectChanges();
    },
    error: err => {
      console.log('MESSAGES ERROR:', err);
    }
  });
}

  // ======================
  // CLICK CHANNEL
  // ======================
  selectChannel(channel: any) {

    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/signup';
      return;
    }

    // إذا نفس القناة
    if (this.activeChannel?.id === channel.id) {
      this.loadMessages(channel.id);
      return;
    }

    this.setActiveChannel(channel);
  }

  // ======================
  // SEND MESSAGE
  // ======================
  sendMessage() {

  if (!this.activeChannel?.isJoined) {
    alert('Please join the channel first');
    return;
  }

  const text = this.newMessage.trim();

  if (!text) return;

  // 🔥 مهم: نظف input فوراً
  this.newMessage = '';

  // 🔥 أضف الرسالة محلياً فوراً (Optimistic UI)
  const tempMsg = {
    messageText: text,
    userId: this.currentUserId,
    userName: 'You',
    sentAt: new Date()
  };

  this.messages = [...this.messages, tempMsg];

  this.scrollToBottom();

  // request
  this.communityService.sendMessage(
  this.activeChannel.id,
  text
).subscribe({
  next: (res: any) => {
    // نضمن أن الرسالة القادمة من السيرفر تحتوي على الـ userId الصحيح الخاص بكِ
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
  // ======================
  // JOIN CHANNEL
  // ======================
  joinChannel() {

    if (!this.activeChannel) return;

    this.communityService.joinChannel(this.activeChannel.id)
      .subscribe({
        next: () => {

          this.activeChannel.isJoined = true;
          this.activeChannel.membersCount++;

          this.cdr.detectChanges();
        },
        error: err => console.log(err)
      });
  }

  // ======================
  // HELPERS
  // ======================
getUserIdFromToken(): number {
  const token = localStorage.getItem('token');
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // التحقق من كافة المسميات الشائعة للـ ID داخل الـ JWT Token
    const rawId = payload.nameid || payload.sub || payload.Id || payload.id || payload.userId;
    return rawId ? parseInt(rawId, 10) : 0;
  } catch {
    return 0;
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

  // السيرفر ممكن يرجع الـ ID بأكثر من مسمى، نأخذ أي واحد متاح
  const msgUserId = msg.userId || msg.userIdHex || msg.user?.id || msg.id;
  
  // تحويل القيمتين لنصوص ومقارنتهم لمنع مشاكل الـ string والـ number
  return String(msgUserId).trim() === String(this.currentUserId).trim();
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
}