import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─────────────────────────────────────────────────────────────────────────────
// Interface — mirrors C# DashboardSummaryDto exactly (camelCase).
// ─────────────────────────────────────────────────────────────────────────────
interface DashboardSummary {
  totalUsers:               number;
  availablePets:            number;
  pendingAdoptions:         number;
  totalActiveSubscriptions: number;
  monthlyRecurringRevenue:  number;
  totalChatChannels:        number;
  totalAiReportsProcessed:  number;
  successfulAiMatches:      number;
  overallAiSuccessRate:     number;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// TODO [TEAM INTEGRATION]: Remove this constant and replace loadSummary() with:
//   this.http.get<DashboardSummary>(`${this.apiBase}/dashboard/summary`).subscribe(...)
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_DASHBOARD_DATA: DashboardSummary = {
  totalUsers:               248,
  availablePets:             63,
  pendingAdoptions:          17,
  totalActiveSubscriptions:  84,
  monthlyRecurringRevenue: 1547.16,
  totalChatChannels:          9,
  totalAiReportsProcessed:   46,
  successfulAiMatches:       39,
  overallAiSuccessRate:      84.8,
};

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  // private readonly apiBase = 'http://localhost:5290/api'; // TODO [TEAM INTEGRATION]

  summary: DashboardSummary = { ...MOCK_DASHBOARD_DATA };
  isSummaryLoading = false;
  summaryError: string | null = null;

  constructor() {}

  ngOnInit(): void { this.loadSummary(); }

  loadSummary(): void {
    // TODO [TEAM INTEGRATION]: Replace the two lines below with the HttpClient call.
    this.isSummaryLoading = false;
    this.summary = { ...MOCK_DASHBOARD_DATA };
  }

  // ── Tab navigation ──────────────────────────────────────────────────────
  activeTab = 'users';
  setActiveTab(tab: string) { this.activeTab = tab; }

  // ════════════════════════════════════════════════════════════════════════
  //  USER MANAGEMENT
  // ════════════════════════════════════════════════════════════════════════

  userSearchText = '';
  selectedUser: any = null;

  get filteredUsers() {
    if (!this.userSearchText) return this.users;
    const t = this.userSearchText.toLowerCase();
    return this.users.filter(u =>
      u.name.toLowerCase().includes(t) ||
      u.email.toLowerCase().includes(t) ||
      u.phone.includes(t)
    );
  }

  users: any[] = [
    { id: 1, name: 'Besan Awwad',       email: 'besoawad1@gmail.com', phone: '+962 79 123 4567', status: 'Active',   role: 'Pet Owner', petsPosted: 3, subscription: 'Premium Plan', activity: 'Last login: 2 hours ago'  },
    { id: 2, name: 'Hashem Aldawaimeh', email: 'dawaimehh@gmail.com', phone: '+962 77 987 6543', status: 'Disabled', role: 'User',      petsPosted: 0, subscription: 'None',         activity: 'Last login: 1 month ago' },
    { id: 3, name: 'Rama Asha',         email: 'rama123@gmail.com',   phone: '+962 78 555 1122', status: 'Active',   role: 'Vet',       petsPosted: 1, subscription: 'Basic Plan',   activity: 'Online Now'              },
    { id: 4, name: 'Ali Hudaib',        email: 'ali.h@gmail.com',     phone: '+962 79 000 1111', status: 'Active',   role: 'Pet Owner', petsPosted: 5, subscription: 'Deluxe Plan',  activity: 'Active yesterday'        }
  ];
  private nextUserId = 5;

  viewUser(user: any) {
    this.selectedUser = user;
    setTimeout(() => document.getElementById('userDetails')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  // ── Soft Delete user ───────────────────────────────────────────────────
  // ARCHITECTURE: Instead of removing the row, we mark it as "Deactivated"
  // in the local array. This mirrors the backend soft-delete pattern:
  //   PUT IsDeleted = true, IsActive = false, DeletedAt = now
  // The row is kept visible so the admin has full audit context.
  deleteUser(id: number): void {
    const user = this.users.find(u => u.id === id);
    if (!user) return;
    if (!confirm(
      `Soft-delete user "${user.name}"?\n\n` +
      `Their account will be deactivated. All pets, adoption requests, ` +
      `and subscriptions are preserved in the database.`
    )) return;

    console.log('[MOCK] DELETE /api/admin/users/' + id, { userId: id });

    // TODO [TEAM INTEGRATION]: Un-comment for integration.
    // this.http.delete(`${this.apiBase}/admin/users/${id}`).subscribe({
    //   next: () => { /* soft-delete applied below */ },
    //   error: err => console.error('Soft-delete failed', err)
    // });

    // Soft delete: mark row visually as deactivated instead of removing it.
    user.status   = 'Deactivated';
    user.activity = 'Account soft-deleted on 2026-06-06';
    if (this.selectedUser?.id === id) {
      this.selectedUser = { ...user }; // refresh detail panel
    }
  }

  // ── Ban / Unban user ──────────────────────────────────────────────────
  banUser(user: any): void {
    const action    = user.status === 'Restricted' ? 'unban' : 'ban';
    const newStatus = action === 'ban' ? 'Restricted' : 'Active';
    if (!confirm(`${action === 'ban' ? 'Restrict' : 'Lift restriction on'} user "${user.name}"?`)) return;

    const payload = { isRestricted: action === 'ban', reason: action === 'ban' ? 'Admin action' : '' };
    console.log(`[MOCK] PUT /api/admin/users/${user.id}/ban`, payload);

    // TODO [TEAM INTEGRATION]: Un-comment for integration.
    // this.http.put(`${this.apiBase}/admin/users/${user.id}/ban`, payload).subscribe({
    //   next: () => { /* status updated below */ },
    //   error: err => console.error('Ban failed', err)
    // });

    user.status = newStatus;
  }

  // ── Add User Modal ────────────────────────────────────────────────────
  showAddUserModal  = false;
  addUserForm = { name: '', email: '', role: 'User' };
  addUserRoles = ['User', 'Pet Owner', 'Vet'];

  openAddUserModal(): void {
    this.addUserForm = { name: '', email: '', role: 'User' };
    this.showAddUserModal = true;
  }

  closeAddUserModal(): void { this.showAddUserModal = false; }

  submitAddUser(): void {
    if (!this.addUserForm.name.trim() || !this.addUserForm.email.trim()) {
      alert('Name and email are required.');
      return;
    }

    const payload = { ...this.addUserForm };
    console.log('[MOCK] POST /api/admin/users/add', payload);

    // TODO [TEAM INTEGRATION]: Un-comment for integration.
    // this.http.post<any>(`${this.apiBase}/admin/users/add`, { ...payload, password: 'TempPass#123' }).subscribe({
    //   next: created => { /* use created.id below */ },
    //   error: err     => console.error('Add user failed', err)
    // });

    this.users.push({
      id:           this.nextUserId++,
      name:         this.addUserForm.name,
      email:        this.addUserForm.email,
      phone:        '—',
      status:       'Active',
      role:         this.addUserForm.role,
      petsPosted:   0,
      subscription: 'None',
      activity:     'Just added — 2026-06-06'
    });

    this.showAddUserModal = false;
  }

  openManageSubModal(sub: any): void {
    this.selectedSub = sub;
    this.manageSubNewStatus = sub?.status ?? 'Active';
    this.showManageSubModal = true;
  }

  closeManageSubModal(): void {
    this.showManageSubModal = false;
    this.selectedSub = null;
  }

  submitManageSub(): void {
    if (!this.selectedSub) return;

    const previousStatus = this.selectedSub.status;
    this.selectedSub.status = this.manageSubNewStatus;
    console.log('[MOCK] PUT /api/admin/subscriptions/' + this.selectedSub.id, {
      status: this.manageSubNewStatus
    });

    if (previousStatus !== this.manageSubNewStatus) {
      this.selectedSub.nextBilling = this.manageSubNewStatus === 'Cancelled'
        ? 'N/A'
        : this.selectedSub.nextBilling || '2026-07-01';
    }

    this.closeManageSubModal();
  }

  riskClass(risk: string): string {
    switch (risk) {
      case 'High': return 'risk-high';
      case 'Medium': return 'risk-medium';
      case 'Low': return 'risk-low';
      default: return 'risk-neutral';
    }
  }

  deleteMessage(id: string | number): void {
    if (!confirm('Delete this reported message permanently?')) return;
    this.reportedMessages = this.reportedMessages.filter(msg => msg.id !== id);
  }

  dismissMessage(id: string | number): void {
    const message = this.reportedMessages.find(msg => msg.id === id);
    if (!message) return;
    message.reportCount = 0;
    message.reportReason = 'Dismissed';
    message.risk = 'Low';
    message.isAutoFlagged = false;
  }

  banChatUser(sender: string): void {
    if (!confirm(`Ban ${sender} from the community chat?`)) return;
    this.reportedMessages = this.reportedMessages.map(msg =>
      msg.sender === sender
        ? { ...msg, reason: 'User banned', risk: 'High' }
        : msg
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  //  SUBSCRIPTIONS
  // ════════════════════════════════════════════════════════════════════════

  showManageSubModal = false;
  selectedSub: any = null;
  manageSubNewStatus = 'Active';

  planDistribution = [
    { label: 'Basic',   count: 7, pct: 35, color: '#6c8ebf' },
    { label: 'Premium', count: 3, pct: 15, color: '#8a5cf3' },
    { label: 'Deluxe',  count: 4, pct: 20, color: '#f8b84c' }
  ];

  searchText = '';

  get filteredSubscriptions() {
    if (!this.searchText) return this.subscriptionsList;
    const t = this.searchText.toLowerCase();
    return this.subscriptionsList.filter(s =>
      s.userName.toLowerCase().includes(t) || s.id.toLowerCase().includes(t)
    );
  }

  subscriptionsList: any[] = [
    { id: 'SUB-001', userName: 'Tamara Abzakh', plan: 'Deluxe',  price: '$28.99/mo', status: 'Active',    nextBilling: '2026-03-01' },
    { id: 'SUB-002', userName: 'Rana Mofeed',   plan: 'Basic',   price: '$8.99/mo',  status: 'Active',    nextBilling: '2026-02-15' },
    { id: 'SUB-003', userName: 'Basel Adarbeh', plan: 'Premium', price: '$18.99/mo', status: 'Cancelled', nextBilling: '2026-01-10' },
  ];

  planStats = { basic: 7, premium: 3, deluxe: 4 };

  // ... 


  // ==================  (AI Lost & Found)-----.....
  aiStats = {
    totalReports: 46,
    successfulMatches: 39,
    accuracy: '92%'
  };

  aiReports = [
    { 
      id: 'MATCH-101', 
      reporter: 'Sami Farawneh', 
      matchPercent: 98, 
      status: 'User Confirmed', // المستخدم أكد أنه حيوانه
      lastUpdate: '2 hours ago'
    },
    { 
      id: 'MATCH-102', 
      reporter: 'Layan S.', 
      matchPercent: 92, 
      status: 'Waiting User',   // النظام لقى تطابق وبستنى رد المستخدم
      lastUpdate: '1 day ago'
    },
    { 
      id: 'MATCH-103', 
      reporter: 'Omar K.', 
      matchPercent: 45, 
      status: 'User Rejected',  // المستخدم قال "لا، مش حيواني"
      lastUpdate: '3 days ago'
    }
  ];


  // ==================== طلبات التبني (Adoption Requests) ==
  adoptionRequests = [
    { 
      id: 'REQ-101', 
      pet: 'Golden Retriever (Dog)', 
      applicant: 'kinda alsayed', 
      owner: 'Ali Olwan',          
      date: '2025-12-19', 
      status: 'Waiting Owner'      
    },
    { 
      id: 'REQ-102', 
      pet: 'Maine Coon (Cat)', 
      applicant: 'Nawras Amayreh', 
      owner: 'Malah kh', 
      date: '2025-12-18', 
      status: 'In Discussion'      
    },
    { 
      id: 'REQ-103', 
      pet: 'Holland Lop (Rabbit)', 
      applicant: 'Rawan R.', 
      owner: 'Sami K.', 
      date: '2025-11-17', 
      status: 'Owner Approved'     
    }
  ];


  //  إدارة الشات  (Chat & Community) ====================
  
  chatStats = {
    dailyMessages: 140,
    activeUsers: 45,
    flaggedCount: 12
  };

  bannedUsers = [
    { 
      id: 201, 
      user: 'SpammerX', 
      reason: 'Sharing malicious links', 
      bannedAt: '2024-12-20', 
      duration: 'Permanent',
      status: 'Banned'
    },
    { 
      id: 205, 
      user: 'AngryUser', 
      reason: 'Offensive language', 
      bannedAt: '2024-12-22', 
      duration: '7 Days',
      status: 'Muted'
    },
    { 
      id: 310, 
      user: 'FakeSeller', 
      reason: 'Scam attempt reported', 
      bannedAt: '2024-12-18', 
      duration: '30 Days',
      status: 'Suspended'
    }
  ]; 

  reportedMessages = [
    { 
      id: 'MSG-991', 
      sender: 'SpammerX', 
      content: 'Win a free iPhone now! Click here...', 
      reportReason: 'Spam', 
      reportCount: 5,
      channelId: '12',
      sentAt: 'Today 11:30 AM',
      risk: 'High',
      isAutoFlagged: true
    },
    { 
      id: 'MSG-992', 
      sender: 'AngryUser', 
      content: 'You are stupid and I hate this app', 
      reportReason: 'Harassment', 
      reportCount: 4,
      channelId: '6',
      sentAt: 'Today 10:15 AM',
      risk: 'Medium',
      isAutoFlagged: false
    },
    { 
      id: 'MSG-993', 
      sender: 'Seller123', 
      content: 'Call me on 0799999 for discount', 
      reportReason: 'Sharing Private Info', 
      reportCount: 2,
      channelId: '3',
      sentAt: 'Yesterday 9:05 PM',
      risk: 'Low',
      isAutoFlagged: false
    }
  ];



  //  إحصائيات الداشبورد العلوية ( بتنحسب لحالها)
  get stats() {
    return {
      totalUsers: this.users.length,
      activeUsers: this.users.filter(u => u.status === 'Active').length,
      petsCount: this.adoptionRequests.length, 
      subscribers: this.subscriptionsList.filter(s => s.status === 'Active').length,
      flaggedCount: this.reportedMessages.length
    };
  }
}