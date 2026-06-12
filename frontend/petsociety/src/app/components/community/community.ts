import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
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
  
  // يمسك حاوية المسجات من الـ HTML لعمل السكرول التلقائي
  @ViewChild('scrollContainer') private myScrollContainer!: ElementRef;

  constructor(private communityService: CommunityService) {}

  // ======================
  // DATA
  // ======================
  newMessage: string = '';

  channels: any[] = [];
  messages: any[] = [];

  activeChannel: any = null;

  // جلب الـ ID الحقيقي للمستخدم الديناميكي من الـ Token بدلاً من الرقم الثابت 1
  currentUserId: number = this.getUserIdFromToken();

  // ======================
  // INIT
  // ======================
  ngOnInit(): void {
    this.loadChannels();
  }

  // يتم استدعاؤها تلقائياً بعد كل تحديث للواجهة (مثل وصول مسج جديدة)
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // ======================
  // LOAD CHANNELS
  // ======================
  loadChannels() {
    // تم تمرير نص فارغ للبحث ليتوافق مع الـ filter بالباك إند
    this.communityService.getChannels('').subscribe({
      next: (res: any) => {
        this.channels = res || [];

        if (this.channels.length > 0) {
          this.activeChannel = this.channels[0];
          this.loadMessages(this.activeChannel.id);
        }
      },
      error: err => console.log('Channels error:', err)
    });
  }

  // ======================
  // LOAD MESSAGES
  // ======================
  loadMessages(channelId: number) {
    if (!channelId) return;

    this.communityService.getMessages(channelId).subscribe({
      next: (res: any) => {
        this.messages = res || [];
      },
      error: err => console.log('Messages error:', err)
    });
  }

  // ======================
  // SELECT CHANNEL
  // ======================
  selectChannel(channel: any) {
    if (!channel?.id) return;

    this.activeChannel = channel;
    this.loadMessages(channel.id);
  }

  // ======================
  // SEND MESSAGE
  // ======================
  sendMessage() {
    if (!this.newMessage.trim()) return;
    if (!this.activeChannel?.id) return;

    this.communityService.sendMessage(
      this.activeChannel.id,
      this.newMessage
    ).subscribe({
      next: (res: any) => {
        // إضافة الرسالة مباشرة للواجهة
        this.messages = [...this.messages, res];

        // زيادة عداد مسجات القناة بالواجهة فوراً بشكل جمالي
        if (this.activeChannel) {
          this.activeChannel.messagesCount++;
        }

        this.newMessage = '';
      },
      error: err => {
        console.log('Send message error:', err);
      }
    });
  }

  // ======================
  // HELPERS & TOKENS
  // ======================
  isMine(msg: any): boolean {
    return msg.userId === this.currentUserId;
  }

  // دالة فك تشفير الـ Token لاستخراج الـ UserId الحقيقي للمستخدم الحالي
  getUserIdFromToken(): number {
    const token = localStorage.getItem('token');
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // 'nameid' هو الاسم الشائع لـ ClaimTypes.NameIdentifier في الـ JWT الراجع من الـ API
      return parseInt(payload.nameid || payload.sub || payload.Id, 10) || 0;
    } catch (e) {
      console.error('Error decoding token', e);
      return 0;
    }
  }

  // دالة إنزال السكرول لأسفل الشات تلقائياً
  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) {
      // تفادي أي خطأ في حال لم تكن الواجهة مستعدة بالكامل بعد
    }
  }
}