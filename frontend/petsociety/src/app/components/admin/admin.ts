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

  // ════════════════════════════════════════════════════════════════════════
  //  SUBSCRIPTIONS
  // ════════════════════════════════════════════════════════════════════════

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

  // ── Manage Subscription Modal ─────────────────────────────────────────
  showManageSubModal  = false;
  selectedSub: any    = null;
  manageSubNewStatus  = '';

  openManageSubModal(sub: any): void {
    this.selectedSub        = sub;
    this.manageSubNewStatus = sub.status === 'Active' ? 'Cancelled' : 'Active';
    this.showManageSubModal = true;
  }

  closeManageSubModal(): void { this.showManageSubModal = false; this.selectedSub = null; }

  submitManageSub(): void {
    if (!this.selectedSub) return;

    console.log(`[MOCK] PUT /api/subscription/subscriptions/${this.selectedSub.id}/manage`, {
      currentStatus: this.selectedSub.status,
      newStatus:     this.manageSubNewStatus
    });

    // TODO [TEAM INTEGRATION]: Un-comment for integration.
    // this.http.put(`${this.apiBase}/subscription/subscriptions/${this.selectedSub.id}/manage`, {}).subscribe({
    //   next: (res: any) => { this.selectedSub.status = res.newStatus; },
    //   error: err => console.error('Manage subscription failed', err)
    // });

    this.selectedSub.status = this.manageSubNewStatus;
    this.closeManageSubModal();
  }

  // ════════════════════════════════════════════════════════════════════════
  //  AI LOST & FOUND — DISPUTED MATCHES
  // ════════════════════════════════════════════════════════════════════════
  // Only shows cases where IsDisputed == true AND ResolvedAt == null.
  // Mirrors GET /api/moderation/ai-disputes
  //
  // TODO [TEAM INTEGRATION]: Replace mock array by calling:
  //   this.http.get<any[]>(`${this.apiBase}/moderation/ai-disputes`)
  //     .subscribe({ next: data => this.disputedMatches = data, error: ... });

  disputedMatches: any[] = [
    {
      id: 'DISP-201',
      title:       'Lost Golden Retriever — Mecca Street',
      species:     'Dog',
      location:    'Amman, Mecca Street',
      finderUser:  'Layan Sawalha',
      ownerUser:   'Omar Khasawneh',
      finderSays:  'Match Confirmed ✓',
      ownerSays:   'Not My Pet ✗',
      conflictNote:'Finder accepts the AI match. Owner insists it\'s a different dog with similar markings.',
      createdAt:   '2026-03-14',
      status:      'Open'
    },
    {
      id: 'DISP-202',
      title:       'Found White Cat — Dabouq Area',
      species:     'Cat',
      location:    'Amman, Dabouq',
      finderUser:  'Sami Farawneh',
      ownerUser:   'Rana Mofeed',
      finderSays:  'Not Sure ?',
      ownerSays:   'That\'s My Cat ✓',
      conflictNote:'Owner is certain from the ear marking. Finder says photo angle is misleading.',
      createdAt:   '2026-04-02',
      status:      'Open'
    },
    {
      id: 'DISP-203',
      title:       'Lost Persian Cat — Sweifieh',
      species:     'Cat',
      location:    'Amman, Sweifieh',
      finderUser:  'Hana Bitar',
      ownerUser:   'Yazeed Nabulsi',
      finderSays:  'Match Confirmed ✓',
      ownerSays:   'Wrong Breed ✗',
      conflictNote:'Both parties have supporting photos. Requires manual image comparison by admin.',
      createdAt:   '2026-05-19',
      status:      'Open'
    }
  ];

  // ── Resolve dispute ────────────────────────────────────────────────────
  resolveDispute(id: string): void {
    const dispute = this.disputedMatches.find(d => d.id === id);
    if (!dispute) return;
    if (!confirm(
      `Resolve dispute "${id}"?\n\nThis will mark the case as resolved and close it. ` +
      `Both parties will be notified.`
    )) return;

    console.log('[MOCK] PUT /api/moderation/ai-disputes/' + id + '/resolve', { reportId: id });

    // TODO [TEAM INTEGRATION]: Un-comment for integration.
    // this.http.put(`${this.apiBase}/moderation/ai-disputes/${id}/resolve`, 'Admin resolved after manual review').subscribe({
    //   next: () => { /* remove from queue below */ },
    //   error: err => console.error('Resolve dispute failed', err)
    // });

    this.disputedMatches = this.disputedMatches.filter(d => d.id !== id);
  }

  // ── Dismiss dispute ────────────────────────────────────────────────────
  dismissDispute(id: string): void {
    const dispute = this.disputedMatches.find(d => d.id === id);
    if (!dispute) return;
    if (!confirm(
      `Dismiss dispute "${id}" due to insufficient evidence?\n\n` +
      `The case will be closed without a resolution.`
    )) return;

    console.log('[MOCK] PUT /api/moderation/ai-disputes/' + id + '/dismiss', { reportId: id });

    // TODO [TEAM INTEGRATION]: Un-comment for integration.
    // this.http.put(`${this.apiBase}/moderation/ai-disputes/${id}/dismiss`, {}).subscribe({
    //   next: () => { /* remove from queue below */ },
    //   error: err => console.error('Dismiss dispute failed', err)
    // });

    this.disputedMatches = this.disputedMatches.filter(d => d.id !== id);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  CHAT & COMMUNITY
  // ════════════════════════════════════════════════════════════════════════

  chatStats = { dailyMessages: 140, flaggedCount: 12 };

  bannedUsers: any[] = [
    { id: 201, user: 'SpammerX',   reason: 'Sharing malicious links', bannedAt: '2026-01-20', duration: 'Permanent', status: 'Banned'    },
    { id: 205, user: 'AngryUser',  reason: 'Offensive language',       bannedAt: '2026-02-22', duration: '7 Days',    status: 'Muted'     },
    { id: 310, user: 'FakeSeller', reason: 'Scam attempt reported',    bannedAt: '2026-03-18', duration: '30 Days',   status: 'Suspended' }
  ];

  // ── Reported Messages (rich mock — two-tier moderation) ────────────────
  // Mirrors GET /api/moderation/flagged-messages.
  // Filter: (IsAutoFlagged == true OR ReportCount >= 3) AND IsSystemDeleted == false.
  // Tombstoned messages (profanity tier) do NOT appear here — they are auto-handled.
  //
  // TODO [TEAM INTEGRATION]: Replace this array by calling:
  //   this.http.get<any[]>(`${this.apiBase}/moderation/flagged-messages`)
  //     .subscribe({ next: data => this.reportedMessages = data, error: ... });
  reportedMessages: any[] = [
    {
      id: 'MSG-991', sender: 'SpammerX',     channelId: 2,
      content:       'Win a free iPhone now! Click here for your prize!!!',
      reportReason:  'Spam',
      reportCount:    7,
      isAutoFlagged:  true,      // Tier 2 (Suspicious): keyword "win now" / "free iphone"
      isSystemDeleted: false,    // NOT tombstoned — text kept for admin review
      risk:          'High',
      sentAt:        '2026-01-20 14:32'
    },
    {
      id: 'MSG-992', sender: 'AngryUser',    channelId: 1,
      content:       'That seller is a total scammer, do not trust him at all!',
      reportReason:  'Harassment',
      reportCount:    5,
      isAutoFlagged:  true,      // Tier 2 (Suspicious): keyword "scammer"
      isSystemDeleted: false,
      risk:          'High',
      sentAt:        '2026-02-14 09:15'
    },
    {
      id: 'MSG-993', sender: 'Seller123',    channelId: 3,
      content:       'Call me on 0799999999 for a special discount deal',
      reportReason:  'Sharing Private Info',
      reportCount:    4,
      isAutoFlagged:  true,      // Tier 2 (Suspicious): keyword "079" (Jordanian phone)
      isSystemDeleted: false,
      risk:          'Medium',
      sentAt:        '2026-03-10 11:45'
    },
    {
      id: 'MSG-994', sender: 'SuspiciousAcc', channelId: 1,
      content:       'Send money via western union, I am in trouble please help',
      reportReason:  'Scam',
      reportCount:    3,
      isAutoFlagged:  false,     // Threshold only (>=3 reports, no keyword match)
      isSystemDeleted: false,
      risk:          'High',
      sentAt:        '2026-04-23 16:01'
    },
    {
      id: 'MSG-995', sender: 'NewUser22',    channelId: 2,
      content:       'Anyone here? Need help with adoption process please',
      reportReason:  'Other',
      reportCount:    3,
      isAutoFlagged:  false,     // Borderline: 3 reports, no keyword — likely false alarm
      isSystemDeleted: false,
      risk:          'Low',
      sentAt:        '2026-05-24 08:30'
    }
  ];

  // ── Risk colour helper ─────────────────────────────────────────────────
  riskClass(risk: string): string {
    return risk === 'High' ? 'churn' : risk === 'Medium' ? 'pending-yellow' : 'active-green';
  }

  // ── Delete reported message (hard-delete via admin endpoint) ────────────
  deleteMessage(id: string): void {
    const msg = this.reportedMessages.find(m => m.id === id);
    if (!msg) return;
    if (!confirm(`Permanently delete message from "${msg.sender}"? This cannot be undone.`)) return;

    console.log('[MOCK] DELETE /api/moderation/messages/' + id, { messageId: id });

    // TODO [TEAM INTEGRATION]: Un-comment for integration.
    // this.http.delete(`${this.apiBase}/moderation/messages/${id}`).subscribe({
    //   next: () => { /* remove from array below */ },
    //   error: err => console.error('Delete message failed', err)
    // });

    this.reportedMessages = this.reportedMessages.filter(m => m.id !== id);
  }

  // ── Dismiss false alarm (clears flags, keeps message) ──────────────────
  dismissMessage(id: string): void {
    const msg = this.reportedMessages.find(m => m.id === id);
    if (!msg) return;
    if (!confirm(`Dismiss report for message "${id}"? The message stays in the channel but all flags will be cleared.`)) return;

    console.log('[MOCK] PUT /api/moderation/messages/' + id + '/dismiss', { messageId: id });

    // TODO [TEAM INTEGRATION]: Un-comment for integration.
    // this.http.put(`${this.apiBase}/moderation/messages/${id}/dismiss`, {}).subscribe({
    //   next: () => { /* remove from review queue below */ },
    //   error: err => console.error('Dismiss failed', err)
    // });

    this.reportedMessages = this.reportedMessages.filter(m => m.id !== id);
  }

  // ── Ban user from chat (from reported messages panel) ──────────────────
  banChatUser(senderName: string): void {
    if (!confirm(`Ban "${senderName}" from community chat?`)) return;

    const payload = { userName: senderName, reason: 'Banned from Moderation Panel', duration: 'Permanent' };
    console.log('[MOCK] POST /api/admin/users/ban-chat', payload);

    // TODO [TEAM INTEGRATION]: Un-comment for integration.
    // this.http.post(`${this.apiBase}/admin/users/ban-chat`, payload).subscribe({
    //   next: () => console.log('User banned'),
    //   error: err => console.error('Ban failed', err)
    // });

    this.reportedMessages = this.reportedMessages.filter(m => m.sender !== senderName);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  PLATFORM ANALYTICS
  // ════════════════════════════════════════════════════════════════════════

  get planDistribution() {
    const total = this.planStats.basic + this.planStats.premium + this.planStats.deluxe;
    return [
      { label: 'Basic',   count: this.planStats.basic,   pct: total ? Math.round(this.planStats.basic   / total * 100) : 0, color: '#6c8ebf' },
      { label: 'Premium', count: this.planStats.premium, pct: total ? Math.round(this.planStats.premium / total * 100) : 0, color: '#9c6bba' },
      { label: 'Deluxe',  count: this.planStats.deluxe,  pct: total ? Math.round(this.planStats.deluxe  / total * 100) : 0, color: '#e8a838' },
    ];
  }
}