import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { AccountService } from '../../services/account.service';
import { DashboardDto } from '../../models/account.models';

@Component({
  selector: 'app-account',
  imports: [CommonModule, RouterModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {
  dashboard: DashboardDto = {
    user: {
      name: '',
      email: '',
      memberSince: 'Member since recently',
      avatarInitial: 'U',
    },
    stats: {
      subscriptionsCount: 0,
      adoptedCount: 0,
    },
    adoptedPets: [],
  };
  loading = true;
  error = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private accountService: AccountService,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;
    this.error = '';

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : sessionStorage.getItem('token');
    const storedName = (typeof localStorage !== 'undefined' ? localStorage.getItem('fullName') : null)
      || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('fullName') : null)
      || 'Pet Parent';
    const storedEmail = (typeof localStorage !== 'undefined' ? localStorage.getItem('userEmail') : null)
      || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('userEmail') : null)
      || '';

    this.dashboard = {
      ...this.dashboard,
      user: {
        name: storedName,
        email: storedEmail,
        memberSince: this.dashboard.user.memberSince || 'Member since recently',
        avatarInitial: storedName ? storedName.trim().charAt(0).toUpperCase() : 'U',
      },
    };

    if (!token) {
      this.loading = false;
      this.error = 'Please sign in to view your account.';
      return;
    }

    this.loading = false;

    this.accountService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = {
          ...dashboard,
          user: {
            ...dashboard.user,
            name: dashboard.user?.name || storedName,
            email: dashboard.user?.email || storedEmail,
            avatarInitial: dashboard.user?.name
              ? dashboard.user.name.trim().charAt(0).toUpperCase()
              : (storedName ? storedName.trim().charAt(0).toUpperCase() : 'U'),
          },
        };
      },
      error: () => {
        this.error = 'Unable to load your account information right now.';
      },
    });
  }

  logout(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.accountService.logout().subscribe({
      next: () => this.auth.logout(),
      error: () => this.auth.logout(),
      complete: () => this.router.navigate(['/Home']),
    });
  }
}
