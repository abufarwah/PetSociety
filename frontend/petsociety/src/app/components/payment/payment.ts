import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { SubscriptionService } from '../../services/subscription.service';

interface Package {
  name: string;
  price: number;
  features: string[];
}

@Component({
  selector: 'app-payment',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment implements OnInit {
  paymentForm!: FormGroup;
  selectedPackage: Package | null = null;
  showSuccess = false;
  isLoggedIn = false;
  paymentError = '';
  isSubmitting = false;

  packages: Package[] = [
    {
      
      name: 'Basic',
      price: 9,
      features: [
        'Free shipping',
        'Pet Dry food (5kg/month)',
        'Pet litter Box Sand (5kg/month)',
        'Pet Treat pack of 2 (1kg each/month)',
        'Email tips for pet care',
      ],
    },
    {
      name: 'Premium',
      price: 19,
      features: [
        'Free shipping',
        'Toy of the month',
        'Pet Dry food (10kg/month)',
        'Pet litter Box Sand (10kg/month)',
        'Pet Treat pack of 2 (2kg each/month)',
      ],
    },
    {
      name: 'Deluxe',
      price: 29,
      features: [
        'Free shipping',
        'Customize box contents',
        'Pet Dry Food (15kg/month)',
        'Pet litter Box Sand (15kg/month)',
        'Pet Treat pack of 4 (4kg each/month)',
        'Exclusive gift (Accessories Box)',
      ],
    },
  ];

  constructor(
    private router: Router,
    private auth: Auth,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit() {
    // Subscribe to auth state AND check localStorage directly
    this.auth.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });

    // Also check localStorage as backup since login.ts uses it directly
    const storedLogin = localStorage.getItem('isLoggedIn') === 'true';
    this.isLoggedIn = storedLogin;
    if (storedLogin) {
      this.auth.isLoggedIn$.next(true);
    }

    this.paymentForm = new FormGroup({
      cardNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]),
      cardName: new FormControl('', [Validators.required, Validators.minLength(3)]),
      expiry: new FormControl('', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]),
      cvv: new FormControl('', [Validators.required, Validators.pattern(/^\d{3}$/)]),
      address: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
    });

    // Auto-format card number
    this.paymentForm.get('cardNumber')?.valueChanges.subscribe((value) => {
      if (value) {
        const cleaned = value.replace(/\s/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        if (formatted !== value) {
          this.paymentForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
        }
      }
    });

    // Auto-format expiry
    this.paymentForm.get('expiry')?.valueChanges.subscribe((value) => {
      if (value && !value.includes('/') && value.length === 2) {
        this.paymentForm.get('expiry')?.setValue(value + '/', { emitEvent: false });
      }
    });
  }

  selectPackage(pkg: Package) {
    this.selectedPackage = pkg;
  }

  get tax(): number {
    if (!this.selectedPackage) return 0;
    return parseFloat((this.selectedPackage.price * 0.11).toFixed(2));
  }

  get total(): number {
    if (!this.selectedPackage) return 0;
    return parseFloat((this.selectedPackage.price + this.tax).toFixed(2));
  }

  processPayment() {
    // Check login state from both Auth service and localStorage
    const isLoggedInAuth = this.isLoggedIn;
    const isLoggedInStorage = localStorage.getItem('isLoggedIn') === 'true';
    const isLoggedIn = isLoggedInAuth || isLoggedInStorage;

    if (!isLoggedIn) {
      alert('Please login first to subscribe 🐾');
      this.router.navigate(['/login'], { queryParams: { redirect: 'payment' } });
      return;
    }

    if (this.paymentForm.invalid || !this.selectedPackage) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.paymentError = '';

    // Simulate payment processing
    console.log('Processing payment...', {
      package: this.selectedPackage,
      payment: this.paymentForm.value,
      total: this.total,
    });

    this.subscriptionService.processPayment(this.selectedPackage.name).subscribe({
      next: () => {
        this.showSuccess = true;
        this.isSubmitting = false;
      },
      error: (error) => {
        this.paymentError = error?.error?.message || error?.message || 'Payment failed';
        this.isSubmitting = false;
      }
    });
  }

  closeSuccess() {
    this.showSuccess = false;
  }

  resetForm() {
    this.paymentForm.reset();
    this.selectedPackage = null;
  }
}
