import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdoptionService } from '../../services/adoption';

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

// Fallback zeros — used only when the API is unreachable.
const EMPTY_SUMMARY: DashboardSummary = {
  totalUsers: 0, availablePets: 0, pendingAdoptions: 0,
  totalActiveSubscriptions: 0, monthlyRecurringRevenue: 0,
  totalChatChannels: 0, totalAiReportsProcessed: 0,
  successfulAiMatches: 0, overallAiSuccessRate: 0,
};

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  private readonly apiBase = 'http://localhost:5290/api';

  // ── Dashboard KPIs ────────────────────────────────────────────────────────
  summary: DashboardSummary = { ...EMPTY_SUMMARY };
  isSummaryLoading = false;
  summaryError: string | null = null;

  constructor(private adoptionService: AdoptionService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadUsers();
    this.loadAdoptionRequests();
    this.loadSubscriptions();
    this.loadFlaggedMessages();
    this.loadChatStats();
  }

  loadSummary(): void {
    this.isSummaryLoading = true;
    this.summaryError = null;
    this.http.get<DashboardSummary>(`${this.apiBase}/Dashboard/summary`).subscribe({
      next:  (data) => { this.summary = data; this.isSummaryLoading = false; },
      error: (err)  => {
        console.error('Dashboard summary failed:', err);
        this.summaryError = 'Unable to load dashboard data.';
        this.isSummaryLoading = false;
      }
    });
  }

  // ── Tab navigation ────────────────────────────────────────────────────────
  activeTab = 'users';
  setActiveTab(tab: string) { this.activeTab = tab; }

  // ════════════════════════════════════════════════════════════════════════════
  //  USER MANAGEMENT — wired to GET /api/admin/users
  // ════════════════════════════════════════════════════════════════════════════

  users: any[] = [];
  isUsersLoading = false;
  usersError: string | null = null;
  userSearchText = '';
  selectedUser: any = null;
  private nextUserId = 1;

  loadUsers(): void {
    this.isUsersLoading = true;
    this.http.get<any[]>(`${this.apiBase}/admin/users`).subscribe({
      next:  (data) => { this.users = data; this.isUsersLoading = false; },
      error: (err)  => {
        console.error('Failed to load users:', err);
        this.usersError = 'Unable to load users.';
        this.isUsersLoading = false;
      }
    });
  }

  get filteredUsers() {
    if (!this.userSearchText) return this.users;
    const t = this.userSearchText.toLowerCase();
    return this.users.filter(u =>
      u.name?.toLowerCase().includes(t) ||
      u.email?.toLowerCase().includes(t) ||
      u.phone?.includes(t)
    );
  }

  viewUser(user: any) {
    this.selectedUser = user;
    setTimeout(() => document.getElementById('userDetails')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  // ── Soft-delete user — DELETE /api/admin/users/{id} ─────────────────────
  deleteUser(id: number): void {
    const user = this.users.find(u => u.id === id);
    if (!user) return;
    if (!confirm(
      `Soft-delete user "${user.name}"?\n\n` +
      `Their account will be deactivated. All data is preserved.`
    )) return;

    this.http.delete(`${this.apiBase}/admin/users/${id}`).subscribe({
      next: () => {
        user.status   = 'Deactivated';
        user.activity = `Deactivated on ${new Date().toLocaleDateString()}`;
        if (this.selectedUser?.id === id) this.selectedUser = { ...user };
      },
      error: err => console.error('Delete failed:', err)
    });
  }

  // ── Ban / Unban user — PUT /api/admin/users/{id}/ban ─────────────────────
  banUser(user: any): void {
    const action    = user.status === 'Restricted' ? 'unban' : 'ban';
    const newStatus = action === 'ban' ? 'Restricted' : 'Active';
    if (!confirm(`${action === 'ban' ? 'Restrict' : 'Lift restriction on'} user "${user.name}"?`)) return;

    const payload = { isRestricted: action === 'ban', reason: action === 'ban' ? 'Admin action' : '' };
    this.http.put(`${this.apiBase}/admin/users/${user.id}/ban`, payload).subscribe({
      next: () => { user.status = newStatus; },
      error: err => console.error('Ban failed:', err)
    });
  }

  // ── Add User Modal — POST /api/admin/users/add ───────────────────────────
  showAddUserModal = false;
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
    const payload = {
      fullName: this.addUserForm.name,
      email:    this.addUserForm.email,
      password: 'TempPass#123',
      role:     this.addUserForm.role
    };
    this.http.post<any>(`${this.apiBase}/admin/users/add`, payload).subscribe({
      next: (created) => {
        this.users.push({
          id:           created.id,
          name:         created.fullName,
          email:        created.email,
          phone:        '—',
          status:       'Active',
          role:         this.addUserForm.role,
          petsPosted:   0,
          subscription: 'None',
          activity:     'Just added'
        });
        this.showAddUserModal = false;
      },
      error: err => {
        console.error('Add user failed:', err);
        alert(err.error?.error || 'Failed to create user.');
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  ADOPTION REQUESTS — wired to AdoptionService (already connected)
  // ════════════════════════════════════════════════════════════════════════════

  adoptionRequests: any[] = [];
  isAdoptionRequestsLoading = false;
  adoptionRequestsError: string | null = null;

  loadAdoptionRequests(): void {
    this.isAdoptionRequestsLoading = true;
    this.adoptionService.getAll().subscribe({
      next: (data: any) => {
        this.adoptionRequests = Array.isArray(data) ? data : [];
        this.isAdoptionRequestsLoading = false;
      },
      error: (err) => {
        console.error('Failed to load adoption requests:', err);
        this.adoptionRequestsError = 'Unable to load adoption requests.';
        this.isAdoptionRequestsLoading = false;
      }
    });
  }

  updateAdoptionRequestStatus(request: any, status: string): void {
    const payload = {
      id: request.id, petId: request.petId,
      phoneNumber: request.phoneNumber,
      deliveryMethod: request.deliveryMethod, status,
    };
    this.adoptionService.updateRequest(payload).subscribe({
      next:  () => { request.status = status; },
      error: (err) => console.error('Failed to update adoption request:', err)
    });
  }

  get pendingAdoptionRequestCount(): number {
    return this.adoptionRequests.filter((r: any) => r.status === 'Pending').length;
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  SUBSCRIPTIONS — wired to GET /api/admin/subscriptions
  // ════════════════════════════════════════════════════════════════════════════

  subscriptionsList: any[] = [];
  isSubsLoading = false;
  showManageSubModal = false;
  selectedSub: any = null;
  manageSubNewStatus = 'Active';
  searchText = '';

  planDistribution = [
    { label: 'Basic',   count: 0, pct: 0, color: '#6c8ebf' },
    { label: 'Premium', count: 0, pct: 0, color: '#8a5cf3' },
    { label: 'Deluxe',  count: 0, pct: 0, color: '#f8b84c' }
  ];
  planStats = { basic: 0, premium: 0, deluxe: 0 };

  loadSubscriptions(): void {
    this.isSubsLoading = true;
    this.http.get<any[]>(`${this.apiBase}/admin/subscriptions`).subscribe({
      next: (data) => {
        this.subscriptionsList = data;
        this.isSubsLoading = false;
        this.computePlanStats();
      },
      error: (err) => {
        console.error('Failed to load subscriptions:', err);
        this.isSubsLoading = false;
      }
    });
  }

  private computePlanStats(): void {
    const active = this.subscriptionsList.filter(s => s.status === 'Active');
    const total  = active.length || 1;
    const basic   = active.filter(s => s.plan?.toLowerCase() === 'basic').length;
    const premium = active.filter(s => s.plan?.toLowerCase() === 'premium').length;
    const deluxe  = active.filter(s => s.plan?.toLowerCase() === 'deluxe').length;
    this.planStats = { basic, premium, deluxe };
    this.planDistribution = [
      { label: 'Basic',   count: basic,   pct: Math.round(basic   / total * 100), color: '#6c8ebf' },
      { label: 'Premium', count: premium, pct: Math.round(premium / total * 100), color: '#8a5cf3' },
      { label: 'Deluxe',  count: deluxe,  pct: Math.round(deluxe  / total * 100), color: '#f8b84c' },
    ];
  }

  get filteredSubscriptions() {
    if (!this.searchText) return this.subscriptionsList;
    const t = this.searchText.toLowerCase();
    return this.subscriptionsList.filter(s =>
      s.userName?.toLowerCase().includes(t) || s.id?.toLowerCase().includes(t)
    );
  }

  openManageSubModal(sub: any): void {
    this.selectedSub = sub;
    this.manageSubNewStatus = sub?.status ?? 'Active';
    this.showManageSubModal = true;
  }
  closeManageSubModal(): void { this.showManageSubModal = false; this.selectedSub = null; }

  // Calls PUT /api/Subscription/subscriptions/{rawId}/manage
  submitManageSub(): void {
    if (!this.selectedSub) return;
    const rawId = this.selectedSub.rawId;
    this.http.put(`${this.apiBase}/Subscription/subscriptions/${rawId}/manage`, {}).subscribe({
      next: (res: any) => {
        this.selectedSub.status = res.isActive ? 'Active' : 'Cancelled';
        this.computePlanStats();
        this.closeManageSubModal();
      },
      error: err => {
        console.error('Manage subscription failed:', err);
        this.closeManageSubModal();
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  MODERATION (Chat & Community) — wired to /api/moderation
  // ════════════════════════════════════════════════════════════════════════════

  reportedMessages: any[] = [];
  isModerationLoading = false;

  chatStats = { dailyMessages: 0, totalMessages: 0, flaggedCount: 0 };
  bannedUsers: any[] = [];

  loadChatStats(): void {
    this.http.get<any>(`${this.apiBase}/Dashboard/chat-stats`).subscribe({
      next: (data) => {
        this.chatStats.dailyMessages  = data.dailyMessages  ?? 0;
        this.chatStats.totalMessages  = data.totalMessages  ?? 0;
        this.chatStats.flaggedCount   = data.flaggedCount   ?? 0;
        this.bannedUsers              = data.restrictedUsers ?? [];
      },
      error: err => console.error('Failed to load chat stats:', err)
    });
  }

  loadFlaggedMessages(): void {
    this.isModerationLoading = true;
    this.http.get<any[]>(`${this.apiBase}/moderation/flagged-messages`).subscribe({
      next: (data) => {
        // Map API shape → template-friendly shape
        this.reportedMessages = data.map(m => ({
          id:            m.id,
          sender:        m.senderName,
          content:       m.messageText,
          reportReason:  m.reportReason  ?? 'Reported',
          reportCount:   m.reportCount   ?? 0,
          channelId:     m.channelId,
          sentAt:        new Date(m.sentAt).toLocaleString(),
          risk:          m.reportCount >= 5 ? 'High' : m.reportCount >= 3 ? 'Medium' : 'Low',
          isAutoFlagged: m.isAutoFlagged
        }));
        this.chatStats.flaggedCount = data.length;
        this.isModerationLoading = false;
      },
      error: err => {
        console.error('Failed to load flagged messages:', err);
        this.isModerationLoading = false;
      }
    });
  }

  // DELETE /api/moderation/messages/{id}
  deleteMessage(id: string | number): void {
    if (!confirm('Delete this reported message permanently?')) return;
    this.http.delete(`${this.apiBase}/moderation/messages/${id}`).subscribe({
      next: () => { this.reportedMessages = this.reportedMessages.filter(m => m.id !== id); },
      error: err => console.error('Delete message failed:', err)
    });
  }

  // PUT /api/moderation/messages/{id}/dismiss
  dismissMessage(id: string | number): void {
    this.http.put(`${this.apiBase}/moderation/messages/${id}/dismiss`, {}).subscribe({
      next: () => {
        const msg = this.reportedMessages.find(m => m.id === id);
        if (msg) { msg.reportCount = 0; msg.reportReason = 'Dismissed'; msg.risk = 'Low'; msg.isAutoFlagged = false; }
      },
      error: err => console.error('Dismiss failed:', err)
    });
  }

  banChatUser(sender: string): void {
    if (!confirm(`Ban ${sender} from the community chat?`)) return;
    this.reportedMessages = this.reportedMessages.map(msg =>
      msg.sender === sender ? { ...msg, reportReason: 'User banned', risk: 'High' } : msg
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  AI REPORTS (static — backend integration pending AI team)
  // ════════════════════════════════════════════════════════════════════════════

  aiStats = { totalReports: 0, successfulMatches: 0, accuracy: '—' };
  aiReports: any[] = [];

  // ── Helpers ───────────────────────────────────────────────────────────────

  riskClass(risk: string): string {
    switch (risk) {
      case 'High':   return 'risk-high';
      case 'Medium': return 'risk-medium';
      case 'Low':    return 'risk-low';
      default:       return 'risk-neutral';
    }
  }

  get stats() {
    return {
      totalUsers:   this.summary.totalUsers,
      activeUsers:  this.users.filter(u => u.status === 'Active').length,
      petsCount:    this.summary.availablePets,
      subscribers:  this.summary.totalActiveSubscriptions,
      flaggedCount: this.reportedMessages.length
    };
  }
}