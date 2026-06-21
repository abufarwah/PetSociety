import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Auth } from '../../services/auth';
import { AccountService } from '../../services/account.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit, OnDestroy {
  dashboard: any = {
    user: { name: '', email: '', memberSince: 'Member since recently', avatarInitial: 'U' },
    stats: { subscriptionsCount: 0, adoptedCount: 0 },
    subscriptions: [],
    adoptedPets: [],
  };
  loading = true;
  error = '';
  
  // لتتبع مراقب التنقلات وإغلاقه عند الخروج من الصفحة منعاً لتسريب الذاكرة
  private routerSubscription!: Subscription;

  constructor(
    public auth: Auth,
    private router: Router,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    // جلب البيانات عند أول تحميل للصفحة
    this.loadDashboard();

    // 🔥 الحل الجذري: مراقبة التنقلات وإعادة جلب البيانات فوراً إذا عاد المستخدم لصفحة الحساب بعد الاشتراك
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadDashboard();
    });
  }

  ngOnDestroy(): void {
    // تنظيف المبرمج عند تدمير المكون
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private loadDashboard(): void {
    this.loading = true; 
    this.error = '';

    // تفريغ المصفوفات القديمة تماماً لتهيئتها لاستقبال البيانات الجديدة والعدادات الجديدة
    this.dashboard.subscriptions = [];
    this.dashboard.adoptedPets = [];

    let token = null;
    let storedName = 'Pet Parent';
    let storedEmail = '';

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      token = localStorage.getItem('token') || sessionStorage.getItem('token');
      storedName = localStorage.getItem('fullName') || sessionStorage.getItem('fullName') || 'Pet Parent';
      storedEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || '';
    }

    this.dashboard.user.name = storedName;
    this.dashboard.user.email = storedEmail;
    this.dashboard.user.avatarInitial = storedName ? storedName.trim().charAt(0).toUpperCase() : 'U';

    if (!token) {
      this.loading = false;
      this.error = 'Please sign in to view your account.';
      return;
    }

    console.log('Sending request to Dashboard API...');

    this.accountService.getDashboard().subscribe({
      next: (res: any) => {
        console.log('Backend Response Received SUCCESSFULLY:', res);
        
        if (res) {
          if (Array.isArray(res)) {
            this.dashboard.stats.adoptedCount = res.length;
            this.dashboard.adoptedPets = res.map((pet: any) => this.mapPetData(pet));
            this.dashboard.subscriptions = [];
            this.dashboard.stats.subscriptionsCount = 0;
          } else {
            // 1. معالجة الحيوانات المتبناة
            const rawPets = res?.adoptedPets || res?.AdoptedPets || res?.adoptedPetsList || [];
            this.dashboard.adoptedPets = rawPets.map((pet: any) => this.mapPetData(pet));
            
            // 2. قراءة كل الاشتراكات القادمة من الباك آند بشكل ديناميكي حقيقي
            const rawSubs = res?.subscriptions || res?.Subscriptions || res?.activeSubscriptions || [];
            this.dashboard.subscriptions = rawSubs.map((sub: any) => this.mapSubscriptionData(sub));

            // 3. تحديث العدادات بناءً على طول المصفوفات الحقيقي الفعلي لضمان زيادة العدد التلقائي
            this.dashboard.stats.adoptedCount = res?.stats?.adoptedCount ?? res?.Stats?.AdoptedCount ?? this.dashboard.adoptedPets.length;
            this.dashboard.stats.subscriptionsCount = this.dashboard.subscriptions.length;
          }
        }

        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Backend Response ERROR:', err);
        this.error = 'Failed to load dashboard data.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapSubscriptionData(sub: any): any {
    let parsedFeatures: string[] = [];
    const rawFeatures = sub.features || sub.Features || sub.featuresList || '';
    
    if (Array.isArray(rawFeatures)) {
      parsedFeatures = rawFeatures;
    } else if (typeof rawFeatures === 'string' && rawFeatures.trim().length > 0) {
      const separator = rawFeatures.includes('|') ? '|' : ',';
      parsedFeatures = rawFeatures.split(separator).map((f: string) => f.trim());
    } else {
      parsedFeatures = ['Full Access Pack', 'Care Package Included'];
    }

    return {
      id: sub.id ?? sub.Id ?? '0',
      planName: sub.planName ?? sub.PlanName ?? sub.packageName ?? sub.PackageName ?? 'Active Plan',
      price: sub.price ?? sub.Price ?? 0,
      featuresList: parsedFeatures
    };
  }

  private mapPetData(pet: any): any {
    return {
      id: pet.id ?? pet.Id ?? 0,
      name: pet.name ?? pet.Name ?? 'Pet',
      type: pet.type ?? pet.Type ?? 'Dog',
      breed: pet.breed ?? pet.Breed ?? 'Domestic Shorthair',
      gender: pet.gender ?? pet.Gender ?? 'Unknown',
      age: pet.age ?? pet.Age ?? '1 Year',
      thumbnail: pet.thumbnail ?? pet.Thumbnail ?? pet.imageUrl ?? pet.ImageUrl ?? '',
      status: pet.status ?? pet.Status ?? 'Approved',
      requestStatus: pet.requestStatus ?? pet.RequestStatus ?? 'Approved'
    };
  }

  cancelSubscription(subId: string): void {
    if (confirm('Are you sure you want to cancel this subscription?')) {
      if (this.accountService && typeof (this.accountService as any).cancelSubscription === 'function') {
        (this.accountService as any).cancelSubscription(subId).subscribe({
          next: () => {
            this.removeSubscriptionLocally(subId);
          },
          error: (err: any) => {
            console.error('Cancellation Error:', err);
            alert('Failed to cancel the subscription. Please try again.');
          }
        });
      } else {
        console.warn('cancelSubscription method not found in AccountService. Removing locally.');
        this.removeSubscriptionLocally(subId);
      }
    }
  }

  private removeSubscriptionLocally(subId: string): void {
    this.dashboard.subscriptions = this.dashboard.subscriptions.filter((s: any) => s.id !== subId);
    this.dashboard.stats.subscriptionsCount = this.dashboard.subscriptions.length;
    this.cdr.detectChanges();
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
