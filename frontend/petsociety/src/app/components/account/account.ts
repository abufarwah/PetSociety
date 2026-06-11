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
    if (!token) {
      this.loading = false;
      this.error = 'Please sign in to view your account.';
      return;
    }

    this.accountService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load your account information right now.';
        this.loading = false;
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
