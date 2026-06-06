import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-pet-society-plus',
  imports: [CommonModule],
  templateUrl: './pet-society-plus.html',
  styleUrl: './pet-society-plus.css',
})
export class PetSocietyPlus {
  showLoginModal = false;

  constructor(private router: Router, private auth: Auth) {}

  goToPayment(plan: string) {
    // Check if user is logged in
    const isLoggedIn = this.auth.isLoggedIn$.value;

    if (!isLoggedIn) {
      this.showLoginModal = true;
      return;
    }

    this.router.navigate(['/payment'], { queryParams: { plan } });
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  goToLogin() {
    this.showLoginModal = false;
    this.router.navigate(['/login']);
  }

}
