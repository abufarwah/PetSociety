import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../services/auth';
import { SubscriptionService, SubscriptionStatusResponse } from '../../../services/subscription.service';

@Component({
  selector: 'app-pet-society-plus',
  imports: [CommonModule],
  templateUrl: './pet-society-plus.html',
  styleUrl: './pet-society-plus.css',
})
export class PetSocietyPlus implements OnInit {
  showLoginModal = false;

  // ── Subscription Status ────────────────────────────────────────────────
  subscriptionStatus: SubscriptionStatusResponse | null = null;
  isStatusLoading = false;

  faqs = [
    {
      question: 'Can I cancel my subscription at any time?',
      answer: 'Yes, absolutely! You can cancel or pause your subscription at any time with just one click from your account dashboard, with no hidden fees or strings attached.',
      isOpen: false
    },
    {
      question: 'How do you choose the products for the boxes?',
      answer: 'Our team of veterinarians and pet care experts carefully curates every item. We partner with the best global brands to ensure the highest quality nutrition, toys, and care products tailored to your pet\'s needs.',
      isOpen: false
    },
    {
      question: 'When is my monthly delivery scheduled?',
      answer: 'Your box is shipped during the first week of every month. You will receive a tracking notification as soon as it is out for delivery, so you know exactly when to expect it.',
      isOpen: false
    },
    {
      question: 'Can I update my pet\'s preferences later?',
      answer: 'Of course! You can always update your pet\'s profile (such as age, size, or allergies) and we will customize your next box based on those updates.',
      isOpen: false
    }
  ];

  constructor(
    private router: Router,
    private auth: Auth,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    // Only fetch status when the user is already logged in
    if (this.auth.isLoggedIn$.value) {
      this.loadSubscriptionStatus();
    }
  }

  loadSubscriptionStatus(): void {
    this.isStatusLoading = true;
    this.subscriptionService.getMyStatus().subscribe({
      next: (status) => {
        this.subscriptionStatus = status;
        this.isStatusLoading = false;
      },
      error: (err) => {
        console.error('Failed to load subscription status:', err);
        this.isStatusLoading = false;
      }
    });
  }

  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  goToPayment(plan: string) {
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
