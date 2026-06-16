// import { Component, OnInit } from '@angular/core';
// import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { SubscriptionService } from '../../services/subscription.service'; // 👈 تم استيراد الخدمة بنجاح هنا

// interface Package {
//   name: string;
//   price: number;
//   features: string[];
// }

// @Component({
//   selector: 'app-payment',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './payment.html',
//   styleUrl: './payment.css',
// })
// export class Payment implements OnInit {
//   paymentForm!: FormGroup;
//   selectedPackage: Package | null = null;
//   showSuccess = false;
//   paymentError = '';
//   paymentSuccessMessage = '';
//   isSubmitting = false;

//   packages: Package[] = [
//     {
//       name: 'Basic',
//       price: 9,
//       features: [
//         'Free shipping',
//         'Pet Dry food (5kg/month)',
//         'Pet litter Box Sand (5kg/month)',
//         'Pet Treat pack of 2 (1kg each/month)',
//         'Email tips for pet care',
//       ],
//     },
//     {
//       name: 'Premium',
//       price: 19,
//       features: [
//         'Free shipping',
//         'Toy of the month',
//         'Pet Dry food (10kg/month)',
//         'Pet litter Box Sand (10kg/month)',
//         'Pet Treat pack of 2 (2kg each/month)',
//       ],
//     },
//     {
//       name: 'Deluxe',
//       price: 29,
//       features: [
//         'Free shipping',
//         'Customize box contents',
//         'Pet Dry Food (15kg/month)',
//         'Pet litter Box Sand (15kg/month)',
//         'Pet Treat pack of 4 (4kg each/month)',
//         'Exclusive gift (Accessories Box)',
//       ],
//     },
//   ];

//   // 👈 هنا قمنا بحقن الخدمة والـ Router داخل الـ Constructor بشكل صحيح
//   constructor(
//     private subscriptionService: SubscriptionService,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.paymentForm = new FormGroup({
//       cardNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]),
//       cardName: new FormControl('', [Validators.required, Validators.minLength(3)]),
//       expiry: new FormControl('', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]),
//       cvv: new FormControl('', [Validators.required, Validators.pattern(/^\d{3}$/)]),
//       address: new FormControl('', Validators.required),
//       city: new FormControl('', Validators.required),
//       postalCode: new FormControl('', Validators.required),
//     });

//     // Auto-format card number
//     this.paymentForm.get('cardNumber')?.valueChanges.subscribe((value) => {
//       if (value) {
//         const cleaned = value.replace(/\s/g, '');
//         const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
//         if (formatted !== value) {
//           this.paymentForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
//         }
//       }
//     });

//     // Auto-format expiry
//     this.paymentForm.get('expiry')?.valueChanges.subscribe((value) => {
//       if (value && !value.includes('/') && value.length === 2) {
//         this.paymentForm.get('expiry')?.setValue(value + '/', { emitEvent: false });
//       }
//     });
//   }

//   selectPackage(pkg: Package) {
//     this.selectedPackage = pkg;
//   }

//   get tax(): number {
//     if (!this.selectedPackage) return 0;
//     return parseFloat((this.selectedPackage.price * 0.11).toFixed(2));
//   }

//   get total(): number {
//     if (!this.selectedPackage) return 0;
//     return parseFloat((this.selectedPackage.price + this.tax).toFixed(2));
//   }

//   // 👈 الميثود المحدثة بالكامل لتقوم بالربط الفعلي مع الـ API والباك إيند
//   processPayment() {
//   if (this.paymentForm.invalid || !this.selectedPackage) {
//     this.paymentForm.markAllAsTouched();
//     return;
//   }

//   this.isSubmitting = true;
//   this.paymentError = '';
//   this.paymentSuccessMessage = '';

//   const paymentData = {
//     packageName: this.selectedPackage.name,
//     cardNumber: this.paymentForm.value.cardNumber?.replace(/\s/g, ''),
//     cardName: this.paymentForm.value.cardName,
//     expiry: this.paymentForm.value.expiry,
//     cvv: this.paymentForm.value.cvv,
//     address: this.paymentForm.value.address,
//     city: this.paymentForm.value.city,
//     postalCode: this.paymentForm.value.postalCode
//   };

//   console.log('Sending Payment:', paymentData);

//   this.subscriptionService.processPayment(paymentData).subscribe({
//     next: (res) => {
//       this.showSuccess = true;
//       this.paymentSuccessMessage =
//         res.message || `Your payment for ${this.selectedPackage?.name} was successful!`;

//       localStorage.setItem('hasActiveSubscription', 'true');
//       localStorage.setItem('subscribedPackage', this.selectedPackage!.name);

//       this.isSubmitting = false;
//     },
//     error: (err) => {
//       console.error('Payment API Error:', err);

//       this.paymentError =
//         err.error?.message ||
//         err.error ||
//         err.message ||
//         'Payment failed';

//       this.isSubmitting = false;
//       this.showSuccess = false;
//     }
//   });
// }

//   closeSuccess() {
//     this.showSuccess = false;
//     this.paymentSuccessMessage = '';
//     this.router.navigate(['/Home']); // التوجيه لصفحة الـ Home بعد إغلاق شاشة النجاح
//   }

//   resetForm() {
//     this.paymentForm.reset();
//     this.selectedPackage = null;
//   }
// }



import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../services/subscription.service';
import { ChangeDetectorRef } from '@angular/core';

interface Package {
  name: string;
  price: number;
  features: string[];
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment implements OnInit {
  paymentForm!: FormGroup;
  selectedPackage: Package | null = null;
  showSuccess = false;
  paymentError = '';
  paymentSuccessMessage = '';
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
  private subscriptionService: SubscriptionService,
  private router: Router,
  private route: ActivatedRoute,
  private cdr: ChangeDetectorRef
) {}
  

  ngOnInit() {
    this.paymentForm = new FormGroup({
      cardNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]),
      cardName: new FormControl('', [Validators.required, Validators.minLength(3)]),
      expiry: new FormControl('', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]),
      cvv: new FormControl('', [Validators.required, Validators.pattern(/^\d{3}$/)]),
      address: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
    });

    this.route.queryParams.subscribe(params => {
      const planName = params['plan'];
      if (planName) {
        const foundPackage = this.packages.find(p => p.name.toLowerCase() === planName.toLowerCase());
        if (foundPackage) {
          this.selectedPackage = foundPackage;
        }
      }
    });

    this.paymentForm.get('cardNumber')?.valueChanges.subscribe((value) => {
      if (value) {
        const cleaned = value.replace(/\s/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        if (formatted !== value) {
          this.paymentForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
        }
      }
    });

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
  if (this.paymentForm.invalid || !this.selectedPackage) {
    this.paymentForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;
  this.paymentError = '';
  this.paymentSuccessMessage = '';

  const paymentData = {
    packageName: this.selectedPackage.name,
    cardNumber: this.paymentForm.value.cardNumber?.replace(/\s/g, ''),
    cardName: this.paymentForm.value.cardName,
    expiry: this.paymentForm.value.expiry,
    cvv: this.paymentForm.value.cvv,
    address: this.paymentForm.value.address,
    city: this.paymentForm.value.city,
    postalCode: this.paymentForm.value.postalCode
  };

  console.log('Sending Payment Request:', paymentData);

  this.subscriptionService.processPayment(paymentData).subscribe({
    next: (res: any) => {
      console.log('Payment Success Response:', res);

      // إيقاف التحميل مباشرة
      this.isSubmitting = false;

      // رسالة النجاح
      this.paymentSuccessMessage =
        res?.message ||
        `Your payment for ${this.selectedPackage?.name} was successful!`;

      // حفظ حالة الاشتراك
      localStorage.setItem('hasActiveSubscription', 'true');
      localStorage.setItem('subscribedPackage', this.selectedPackage!.name);

      // إظهار نافذة النجاح مباشرة
      this.showSuccess = true;

      // إجبار Angular على تحديث الواجهة
      this.cdr.detectChanges();
    },

    error: (err) => {
      console.error('Payment Error Response:', err);

      this.paymentError =
        err.error?.message ||
        err.error?.error ||
        (typeof err.error === 'string' ? err.error : '') ||
        err.message ||
        'An error occurred during payment. Please try again.';

      this.isSubmitting = false;
      this.showSuccess = false;

      this.cdr.detectChanges();
    }
  });
}
  // دالة الإغلاق عند الضغط على زر OK داخل المودال
  closeSuccess() {
    this.showSuccess = false;
    this.paymentSuccessMessage = '';
    
    // تصفير النموذج بالكامل للتأكد من عدم تعليق أي قيم عند العودة
    this.resetForm();

    // التوجيه إلى الصفحة الرئيسية بعد التصفير
    this.router.navigate(['/Home']);
  }

  // دالة التصفير الآمنة
  resetForm() {
    this.paymentForm.reset({
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvv: '',
      address: '',
      city: '',
      postalCode: ''
    });
    // إعادة تعيين الحالات البرمجية للوضع الافتراضي
    this.paymentForm.markAsPristine();
    this.paymentForm.markAsUntouched();
    this.selectedPackage = null;
    this.paymentError = '';
    this.isSubmitting = false;
  }

  
}