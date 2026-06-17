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
  isAdmin: boolean = false;

  showAddChannelModal: boolean = false;
  newChannelName: string = '';
  newChannelDescription: string = '';
  newChannelIcon: string = '💬';

  showEditChannelModal: boolean = false;
  selectedChannelToEdit: any = { id: null, name: '', description: '', icon: '' };

  editingMessageId: number | null = null;
  editingText: string = '';

  ngOnInit(): void {
    this.checkAdminStatus();
    this.loadChannels();
    console.log('CURRENT USER ID = ', this.currentUserId);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  checkAdminStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.isAdmin = false;
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      this.isAdmin = role === 'Admin';
    } catch {
      this.isAdmin = false;
    }
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
        let fetchedChannels = res?.data ?? res ?? [];

        if (!Array.isArray(fetchedChannels)) {
          console.error('Channels is not array', fetchedChannels);
          this.channels = [];
          return;
        }

        // تطبيق ترتيب القنوات المحفوظ في localStorage حتى لا يتغير الترتيب بعد الريفرش
        this.channels = this.sortChannelsBySavedOrder(fetchedChannels);

        if (this.channels.length === 0) return;

        const savedId = localStorage.getItem('activeChannelId');
        const channel = this.channels.find(c => c.id == savedId) || this.channels[0];

        this.setActiveChannel(channel);

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
    if (!channelId) return;

    this.messages = [];
    this.communityService.getMessages(channelId).subscribe({
      next: (res: any) => {
        this.messages = Array.isArray(res) ? res : (res?.data ?? []);
        this.cdr.detectChanges();
        console.log('MESSAGES:', this.messages);
      },
      error: err => console.log('MESSAGES ERROR:', err)
    });
  }

  selectChannel(channel: any) {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/signup';
      return;
    }

    if (this.activeChannel?.id === channel.id) {
      this.loadMessages(channel.id);
      return;
    }

    this.setActiveChannel(channel);
  }

  addChannel() {
    if (!this.newChannelName.trim()) {
      alert('Please enter a channel name');
      return;
    }

    this.communityService.createChannel(this.newChannelName, this.newChannelDescription, this.newChannelIcon).subscribe({
      next: () => {
        alert('Channel created successfully');
        this.showAddChannelModal = false;
        this.newChannelName = '';
        this.newChannelDescription = '';
        this.newChannelIcon = '💬';
        this.loadChannels();
      },
      error: err => {
        console.error(err);
        alert('Failed to create channel');
      }
    });
  }

  openEditChannelModal(channel: any) {
    this.selectedChannelToEdit = { ...channel };
    this.showEditChannelModal = true;
  }

  updateChannel() {
    if (!this.selectedChannelToEdit.name.trim()) {
      alert('Channel name cannot be empty');
      return;
    }

    this.communityService.editChannel(
      this.selectedChannelToEdit.id,
      this.selectedChannelToEdit.name,
      this.selectedChannelToEdit.description,
      this.selectedChannelToEdit.icon
    ).subscribe({
      next: () => {
        alert('Channel updated successfully');
        this.showEditChannelModal = false;
        this.loadChannels();
      },
      error: err => {
        console.error(err);
        alert('Failed to update channel');
      }
    });
  }

  deleteChannel(channelId: number, channelName: string) {
    if (confirm(`Are you sure you want to permanently delete "${channelName}" and all its messages?`)) {
      this.communityService.deleteChannel(channelId).subscribe({
        next: () => {
          alert('Channel deleted successfully');
          if (this.activeChannel?.id === channelId) {
            localStorage.removeItem('activeChannelId');
            this.activeChannel = null;
          }
          this.loadChannels();
        },
        error: err => {
          console.error(err);
          alert('Failed to delete channel');
        }
      });
    }
  }

  kickUser(userId: string, userName: string) {
    if (!this.activeChannel) return;
    
    if (confirm(`Are you sure you want to kick ${userName} from this platform/channel?`)) {
      this.communityService.kickUserFromChannel(this.activeChannel.id, userId).subscribe({
        next: () => {
          alert(`${userName} has been kicked.`);
          this.loadMessages(this.activeChannel.id);
        },
        error: err => {
          console.error(err);
          alert('User kicked successfully');
          this.loadMessages(this.activeChannel.id);
        }
      });
    }
  }

  sendMessage() {
    if (!this.activeChannel?.isJoined && !this.isAdmin) {
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

    this.communityService.sendMessage(this.activeChannel.id, text).subscribe({
      next: (res: any) => {
        let responseData = res?.data ?? res;
        
        if (responseData && !responseData.userId) {
          responseData.userId = this.currentUserId;
        }
        
        this.messages = this.messages.map(m => m === tempMsg ? responseData : m);
        
        // تعديل الـ UI وزيادة عدد الرسائل محلياً لحين عمل ريفريش متكامل مستقبلاً من السيرفر
        if (this.activeChannel.messagesCount !== undefined) {
          this.activeChannel.messagesCount++;
        }

        // دفع القناة النشطة للأعلى وحفظ الترتيب بذاكرة المتصفح
        this.moveChannelToTop(this.activeChannel.id);
        this.cdr.detectChanges();
      },
      error: err => {
        console.log(err);
        this.messages = this.messages.filter(m => m !== tempMsg);
      }
    });
  }

  startEdit(msg: any) {
    this.editingMessageId = msg.id;
    this.editingText = msg.messageText;
  }

  cancelEdit() {
    this.editingMessageId = null;
    this.editingText = '';
  }

  saveEdit(msg: any) {
    const trimmed = this.editingText.trim();
    if (!trimmed || trimmed === msg.messageText) {
      this.cancelEdit();
      return;
    }

    this.communityService.editMessage(msg.id, trimmed).subscribe({
      next: () => {
        msg.messageText = trimmed;
        this.cancelEdit();
        this.cdr.detectChanges();
      },
      error: err => {
        console.log(err);
        msg.messageText = trimmed; 
        this.cancelEdit();
      }
    });
  }

  deleteMessage(msgId: number) {
    if (confirm('Are you sure you want to delete this message?')) {
      this.communityService.deleteMessage(msgId).subscribe({
        next: () => {
          this.messages = this.messages.filter(m => m.id !== msgId);
          if (this.activeChannel.messagesCount > 0) {
            this.activeChannel.messagesCount--;
          }
          this.cdr.detectChanges();
        },
        error: err => {
          console.log(err);
          this.messages = this.messages.filter(m => m.id !== msgId);
        }
      });
    }
  }

  joinChannel() {
    if (!this.activeChannel) return;

    this.communityService.joinChannel(this.activeChannel.id).subscribe({
      next: () => {
        this.activeChannel.isJoined = true;
        this.activeChannel.membersCount++;
        
        // دفع القناة النشطة للأعلى عند الـ Join وحفظ الترتيب
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
          if (this.activeChannel.membersCount > 0) this.activeChannel.membersCount--;
          this.cdr.detectChanges();
        },
        error: err => {
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
      return (
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        payload.nameid ||
        payload.sub ||
        payload.id ||
        payload.userId ||
        null
      );
    } catch {
      return null;
    }
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch {}
  }

  isMine(msg: any): boolean {
    if (!msg || !this.currentUserId) return false;
    const msgUserId = msg.userId || msg.userIdHex || msg.user?.id || msg.createdBy || msg.UserId;
    
    if (!msgUserId) return false;
    return msgUserId.toString().trim() === this.currentUserId.toString().trim();
  }

  getAvatar(msg: any): string {
    if (this.isMine(msg)) return 'Y';
    const name = msg.userName;
    if (!name) return '?';
    return name.split(' ').filter((n: string) => n.length > 0).map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  private moveChannelToTop(channelId: number) {
    if (!this.channels || this.channels.length <= 1) return;
    const targetIndex = this.channels.findIndex(c => c.id === channelId);
    if (targetIndex > 0) {
      const targetChannel = this.channels[targetIndex];
      
      this.channels.splice(targetIndex, 1);
      this.channels = [targetChannel, ...this.channels];

      // حفظ الترتيب الجديد في الـ localStorage
      const orderIds = this.channels.map(c => c.id);
      localStorage.setItem('channelsOrder', JSON.stringify(orderIds));
      
      this.cdr.detectChanges();
    }
  }

  private sortChannelsBySavedOrder(fetchedChannels: any[]): any[] {
    const savedOrderRaw = localStorage.getItem('channelsOrder');
    if (!savedOrderRaw) return fetchedChannels;

    try {
      const orderIds: number[] = JSON.parse(savedOrderRaw);
      return fetchedChannels.sort((a, b) => {
        const indexA = orderIds.indexOf(a.id);
        const indexB = orderIds.indexOf(b.id);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
      });
    } catch {
      return fetchedChannels;
    }
  }
}