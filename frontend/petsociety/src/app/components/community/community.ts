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
  channelMembers: any[] = [];
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
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  checkAdminStatus() {
    const token = localStorage.getItem('token');
    if (!token) { this.isAdmin = false; return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      this.isAdmin = role === 'Admin';
    } catch { this.isAdmin = false; }
  }

  get filteredChannels() {
    if (!this.searchQuery.trim()) return this.channels;
    return this.channels.filter(channel =>
      channel.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      channel.description?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  loadChannels() {
    this.communityService.getChannels().subscribe({
      next: (res: any) => {
        let fetchedChannels = res?.data ?? res ?? [];
        if (!Array.isArray(fetchedChannels)) { this.channels = []; return; }

        this.channels = this.sortChannelsBySavedOrder(fetchedChannels);
        if (this.channels.length === 0) return;

        const savedId = localStorage.getItem('activeChannelId');
        const channel = savedId
          ? (this.channels.find(c => c.id == savedId) || this.channels[0])
          : this.channels[0];

        this.setActiveChannelDisplay(channel);

        setTimeout(() => { this.cdr.detectChanges(); });
      },
      error: err => console.log(err)
    });
  }

setActiveChannelDisplay(channel: any) {
  if (!channel?.id) return;
  this.activeChannel = channel;
  this.messages = [];
  this.channelMembers = [];
  
  setTimeout(() => { 
    this.loadMessages(channel.id); 
    this.loadChannelMembers(channel.id);
  }, 0);
}

loadChannelMembers(channelId: number) {
  this.communityService.getChannelMembers(channelId).subscribe({
    next: (res: any) => {
      this.channelMembers = res ?? [];
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.log('MEMBERS ERROR:', err);
    }
  });
}

showMembersModal: boolean = false;

openMembersModal() {
  this.showMembersModal = true;
  this.cdr.detectChanges();
}

  setActiveChannel(channel: any) {
    if (!channel?.id) return;
    this.activeChannel = channel;

    if (channel.isJoined || this.isAdmin) {
      localStorage.setItem('activeChannelId', channel.id);
    }

    this.messages = [];
    setTimeout(() => { this.loadMessages(channel.id); }, 0);
  }

  loadMessages(channelId: number) {
    if (!channelId) return;
    this.messages = [];
    this.communityService.getMessages(channelId).subscribe({
      next: (res: any) => {
        this.messages = Array.isArray(res) ? res : (res?.data ?? []);
        this.cdr.detectChanges();
      },
      error: err => console.log('MESSAGES ERROR:', err)
    });
  }

  selectChannel(channel: any) {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/signup'; return; }
    if (this.activeChannel?.id === channel.id) { this.loadMessages(channel.id); return; }
    this.setActiveChannel(channel);
  }

  joinChannel() {
    if (!this.activeChannel) return;
    this.communityService.joinChannel(this.activeChannel.id).subscribe({
      next: () => {
        this.activeChannel.isJoined = true;
        this.activeChannel.membersCount++;

        localStorage.setItem('activeChannelId', this.activeChannel.id);

        this.moveChannelToTop(this.activeChannel.id);
        this.activeChannel = { ...this.activeChannel };
        this.cdr.detectChanges();
      },
      error: err => console.log(err)
    });
  }

 
leaveChannel() {
  if (!this.activeChannel) return;
  if (confirm(`Are you sure you want to leave ${this.activeChannel.name}?`)) {
    
    console.log('=== LEAVE START ===');
    console.log('Channel ID:', this.activeChannel.id);
    console.log('isJoined before:', this.activeChannel.isJoined);
    
    this.communityService.leaveChannel(this.activeChannel.id).subscribe({
      next: (res: any) => {
        console.log('=== LEAVE SUCCESS ===', res);
        console.log('Response:', JSON.stringify(res));
        
        this.activeChannel.isJoined = false;
        if (this.activeChannel.membersCount > 0) this.activeChannel.membersCount--;
        localStorage.removeItem('activeChannelId');
        this.activeChannel = { ...this.activeChannel };
        
        console.log('isJoined after:', this.activeChannel.isJoined);
        console.log('localStorage activeChannelId:', localStorage.getItem('activeChannelId'));
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('=== LEAVE ERROR ===', err);
        console.log('Status:', err.status);
        console.log('Message:', err.message);
        
        this.activeChannel.isJoined = false;
        if (this.activeChannel.membersCount > 0) this.activeChannel.membersCount--;
        localStorage.removeItem('activeChannelId');
        this.activeChannel = { ...this.activeChannel };
        this.cdr.detectChanges();
      }
    });
  }
}

  addChannel() {
    if (!this.newChannelName.trim()) { alert('Please enter a channel name'); return; }
    this.communityService.createChannel(this.newChannelName, this.newChannelDescription, this.newChannelIcon).subscribe({
      next: () => {
        alert('Channel created successfully');
        this.showAddChannelModal = false;
        this.newChannelName = '';
        this.newChannelDescription = '';
        this.newChannelIcon = '💬';
        this.loadChannels();
      },
      error: err => { console.error(err); alert('Failed to create channel'); }
    });
  }

  openEditChannelModal(channel: any) {
    this.selectedChannelToEdit = { ...channel };
    this.showEditChannelModal = true;
  }

  updateChannel() {
    if (!this.selectedChannelToEdit.name.trim()) { alert('Channel name cannot be empty'); return; }
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
      error: err => { console.error(err); alert('Failed to update channel'); }
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
        error: err => { console.error(err); alert('Failed to delete channel'); }
      });
    }
  }

  kickUser(userId: string, userName: string) {
    if (!this.activeChannel) return;
    if (confirm(`Are you sure you want to kick ${userName} from this platform/channel?`)) {
      this.communityService.kickUserFromChannel(this.activeChannel.id, userId).subscribe({
        next: () => {
          alert(`${userName} has been kicked.`);
          if (userId?.toString() === this.currentUserId?.toString()) {
            this.activeChannel.isJoined = false;
            localStorage.removeItem('activeChannelId');
            this.activeChannel = { ...this.activeChannel };
          }
          this.loadMessages(this.activeChannel.id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
          alert(`${userName} has been kicked.`);
          this.loadMessages(this.activeChannel.id);
        }
      });
    }
  }

  sendMessage() {
    if (!this.activeChannel?.isJoined && !this.isAdmin) { alert('Please join the channel first'); return; }
    const text = this.newMessage.trim();
    if (!text) return;
    this.newMessage = '';
    const tempMsg = { messageText: text, userId: this.currentUserId, userName: 'You', sentAt: new Date() };
    this.messages = [...this.messages, tempMsg];
    this.scrollToBottom();
    this.communityService.sendMessage(this.activeChannel.id, text).subscribe({
      next: (res: any) => {
        let responseData = res?.data ?? res;
        if (responseData && !responseData.userId) responseData.userId = this.currentUserId;
        this.messages = this.messages.map(m => m === tempMsg ? responseData : m);
        if (this.activeChannel.messagesCount !== undefined) this.activeChannel.messagesCount++;
        this.moveChannelToTop(this.activeChannel.id);
        this.cdr.detectChanges();
      },
      error: err => { console.log(err); this.messages = this.messages.filter(m => m !== tempMsg); }
    });
  }

  startEdit(msg: any) { this.editingMessageId = msg.id; this.editingText = msg.messageText; }
  cancelEdit() { this.editingMessageId = null; this.editingText = ''; }

  saveEdit(msg: any) {
    const trimmed = this.editingText.trim();
    if (!trimmed || trimmed === msg.messageText) { this.cancelEdit(); return; }
    this.communityService.editMessage(msg.id, trimmed).subscribe({
      next: () => { msg.messageText = trimmed; this.cancelEdit(); this.cdr.detectChanges(); },
      error: err => { console.log(err); msg.messageText = trimmed; this.cancelEdit(); }
    });
  }

  deleteMessage(msgId: number) {
    if (confirm('Are you sure you want to delete this message?')) {
      this.communityService.deleteMessage(msgId).subscribe({
        next: () => {
          this.messages = this.messages.filter(m => m.id !== msgId);
          if (this.activeChannel.messagesCount > 0) this.activeChannel.messagesCount--;
          this.cdr.detectChanges();
        },
        error: err => { console.log(err); this.messages = this.messages.filter(m => m.id !== msgId); }
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
        payload.nameid || payload.sub || payload.id || payload.userId || null
      );
    } catch { return null; }
  }

  private scrollToBottom(): void {
    try { this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight; } catch {}
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
      localStorage.setItem('channelsOrder', JSON.stringify(this.channels.map(c => c.id)));
      this.cdr.detectChanges();
    }
  }

  private sortChannelsBySavedOrder(fetchedChannels: any[]): any[] {
    const savedOrderRaw = localStorage.getItem('channelsOrder');
    if (!savedOrderRaw) return fetchedChannels;
    try {
      const orderIds: number[] = JSON.parse(savedOrderRaw);
      return fetchedChannels.sort((a, b) => {
        const iA = orderIds.indexOf(a.id), iB = orderIds.indexOf(b.id);
        if (iA !== -1 && iB !== -1) return iA - iB;
        if (iA !== -1) return -1;
        if (iB !== -1) return 1;
        return 0;
      });
    } catch { return fetchedChannels; }
  }
  
}