import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LostFoundService } from '../../services/lostfound.service';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-lost-found',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lost-found.html',
  styleUrls: ['./lost-found.css']
})
export class LostFoundComponent implements OnInit {

  queryImageName: string | null = null;
  queryImagePreview: string | ArrayBuffer | null = null;
  queryImageFile: File | null = null;
  searchResultMessage: string | null = null;
  aiMatches: any[] = [];

  // Interactive How-It-Works State
  currentStep: number = 1;
  isDemoMode: boolean = true;
  demoInterval: any;

  // متغيرات العدادات
  lostCount: number = 0;
  foundCount: number = 0;
  reunitedCount: number = 0;

  @ViewChild('queryInput') queryInputVariable!: ElementRef;

  currentUserId: number | null = null;
  isLoggedIn = false; // أضفنا متغير حالة تسجيل الدخول
  isAdmin = false;
  reportImageFile: File | null = null;
  editingReport: any = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private lostFoundService: LostFoundService,
    private auth: Auth
  ) {}

  // 1. يمنع إدخال أي شيء غير الأرقام (يسمح بالـ + في البداية فقط)
validatePhoneInput(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;
  const charCode = event.which ? event.which : event.keyCode;

  // يسمح بالرقم فقط (48-57)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}

// 2. يضمن أن يبدأ الرقم بـ +962 ويقيد الطول بـ 13 خانة (3 للرمز + 9 للأرقام)
enforceFormat(event: any) {
  let value = event.target.value;

  // إزالة أي شيء ليس رقماً
  value = value.replace(/[^0-9]/g, '');

  // التأكد من إضافة +962 في البداية إذا لم تكن موجودة
  if (!value.startsWith('962')) {
    value = '962' + value;
  }

  // تقييد الطول بـ 12 رقم (962 + 9 أرقام = 12 خانة)
  if (value.length > 12) {
    value = value.substring(0, 12);
  }

  // إعادة القيمة المنسقة مع الـ +
  this.reportForm.phone = '+' + value;
}
  ngOnInit() {
    // إعداد القيم الأولية فوراً عند تحميل الصفحة
    this.isLoggedIn = this.auth.isLoggedIn$.value;
    this.isAdmin = this.auth.isAdmin$.value;
    this.currentUserId = this.getCurrentUserId();

    // الاشتراك في حالة الصلاحيات وتحديثها ديناميكياً
    this.auth.isAdmin$.subscribe((v) => {
      this.isAdmin = v;
      this.cdr.detectChanges();
    });

    this.auth.isLoggedIn$.subscribe((v) => {
      this.isLoggedIn = v;
      this.currentUserId = this.getCurrentUserId();
      this.cdr.detectChanges();
    });

    // تشغيل العدادات
    this.startCounter('lostCount', 120);
    this.startCounter('foundCount', 85);
    this.startCounter('reunitedCount', 50);

    // Start Demo Animation for How It Works
    this.startDemoAnimation();

    // جلب المنشورات من قاعدة البيانات
    this.loadPosts();
  }

  startCounter(prop: 'lostCount' | 'foundCount' | 'reunitedCount', target: number) {
    let current = 0;
    const duration = 2000; 
    const steps = 50; 
    const increment = target / steps; 
    const stepTime = duration / steps; 

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        this[prop] = target;
        clearInterval(timer);
      } else {
        this[prop] = Math.floor(current);
      }
      
      this.cdr.detectChanges(); 
    }, stepTime);
  }

  startDemoAnimation() {
    this.demoInterval = setInterval(() => {
      if (this.isDemoMode) {
        this.currentStep = this.currentStep >= 4 ? 1 : this.currentStep + 1;
        this.cdr.detectChanges();
      }
    }, 2500);
  }

  stopDemoAnimation() {
    this.isDemoMode = false;
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
    }
  }

  setStep(step: number) {
    this.stopDemoAnimation();
    this.currentStep = step;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.queryImageName = file.name;
        this.queryImagePreview = reader.result;
        this.queryImageFile = file;
        this.searchResultMessage = null;
        this.stopDemoAnimation();
        this.currentStep = 2; // Advance to step 2 after upload
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage() {
    this.queryImageName = null;
    this.queryImagePreview = null;
    this.queryImageFile = null;
    this.searchResultMessage = null;

    if (this.queryInputVariable)
      this.queryInputVariable.nativeElement.value = '';
      
    this.stopDemoAnimation();
    this.currentStep = 1; // Reset to step 1
  }

  searchSimilarPets() {
    if (!this.queryImageFile) return;

    this.searchResultMessage = 'Analyzing image and searching for matches...';
    this.aiMatches = [];
    this.currentStep = 3; // Advance to step 3 (Searching)
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('queryImage', this.queryImageFile, this.queryImageFile.name);

    fetch('https://localhost:44371/api/LostFoundReports/compare', { 
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      console.log('AI Response:', data);
      this.searchResultMessage = 'AI comparison finished successfully! Match confidence: ' + 
        (data.matches && data.matches.length > 0 ? (data.matches[0].confidence * 100).toFixed(1) + '%' : 'no matches found');
      
      if (data.matches) {
        const backendBase = 'https://localhost:44371';
        this.aiMatches = data.matches.map((m: any) => {
          const p = m.post;
          const imageUrl = p.imageUrl || p.ImageUrl || '';
          const image = imageUrl.startsWith('/') ? backendBase + imageUrl : imageUrl;
          
          return {
            id: p.id,
            type: p.type,
            title: p.breed ? `${p.breed} (${p.petType})` : p.petType,
            species: p.petType,
            excerpt: p.excerpt || p.description || '',
            location: p.location,
            dateText: p.dateLastSeen ? new Date(p.dateLastSeen).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString(),
            image,
            phone: p.reporterPhone,
            status: p.status,
            reporterName: p.reporterName,
            confidence: (m.confidence * 100).toFixed(1) + '%'
          };
        });
      }
      this.currentStep = 4; // Advance to step 4 (Results)
      this.cdr.detectChanges();
    })
    .catch(error => {
      console.error('Error connecting to AI service:', error);
      this.searchResultMessage = 'Image uploaded but the AI backend service is not reachable or failed.';
      this.currentStep = 1; // Reset on error
      this.cdr.detectChanges();
    });
  }

  // --- Real DB Posts Loading ---
  loadPosts() {
    this.lostFoundService.getReports().subscribe({
      next: (data) => {
        const backendBase = 'https://localhost:44371';
        this.posts = (data.items || []).map((p: any) => {
          const imageUrl = p.imageUrl || p.ImageUrl || '';
          const image = imageUrl.startsWith('/') ? backendBase + imageUrl : imageUrl;

          return {
            id: p.id,
            type: p.type,
            title: p.breed ? `${p.breed} (${p.petType})` : p.petType,
            species: p.petType,
            excerpt: p.excerpt || p.description || '',
            location: p.location,
            dateText: p.dateLastSeen ? new Date(p.dateLastSeen).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString(),
            image,
            phone: p.reporterPhone,
            // التأكد من جلب معرّف صاحب المنشور بكل الصيغ الممكنة من الـ API لربطه بالـ HTML
            reporterUserId: p.reporterUserId ?? p.ReporterUserId ?? p.userId ?? p.UserId ?? null,
            status: p.status,
            reporterName: p.reporterName,
            breed: p.breed,
            color: p.colorMarkings,
            description: p.description,
            petType: p.petType,
            dateLastSeen: p.dateLastSeen,
            createdAt: p.createdAt,
            showMenu: false // تعيين حالة القائمة المنسدلة الافتراضية لكل منشور
          };
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading lost & found reports:', err);
      }
    });
  }

  viewFilter: 'all' | 'lost' | 'found' = 'all';
  animalFilter: string = 'All Animals';
  animals: string[] = ['All Animals', 'Dog', 'Cat', 'Rabbit', 'Hamster', 'Bird', 'Turtle'];

  selectedContactPostId: number | null = null;
  selectedContactPhone: string | null = null;

  posts: Array<any> = [];

  get filteredPosts() {
    return this.posts.filter(p => {
      const byView = this.viewFilter === 'all' ? true : p.type === this.viewFilter;
      const byAnimal = this.animalFilter === 'All Animals' ? true : p.species.toLowerCase().includes(this.animalFilter.toLowerCase());
      return byView && byAnimal;
    });
  }

  setViewFilter(mode: 'all' | 'lost' | 'found') { this.viewFilter = mode; }
  setAnimalFilter(name: string) { this.animalFilter = name; }

  contactOwner(post: any) {
    this.selectedContactPostId = post.id;
    console.log('بيانات المنشور الفردي:', post);
    this.selectedContactPhone = post.ReporterPhone || post.reporterPhone || post.phone || post.phoneNumber || 'لا يوجد رقم';
  }

  contactFinder(post: any) {
    this.selectedContactPostId = post.id;
    console.log('بيانات المنشور الفردي:', post);
    this.selectedContactPhone = post.ReporterPhone || post.reporterPhone || post.phone || post.phoneNumber || 'لا يوجد رقم';
  }

  toggleDropdown(event: Event, post: any) {
    event.stopPropagation();
    this.posts.forEach(p => {
      if (p.id !== post.id) p.showMenu = false;
    });
    post.showMenu = !post.showMenu;
  }

  onDeletePost(post: any) {
    this.deleteReport(post);
  }

  reportModalVisible: boolean = false;
  modalMode: 'lost' | 'found' = 'lost';
  reportForm: any = this.emptyReport();

  emptyReport() {
    return {
      petType: 'Dog',
      breed: '',
      color: '',
      dateLastSeen: '',
      location: '',
      description: '',
      photoName: null,
      reporterName: '',
      phone: ''
    };
  }

  getCurrentUserId(): number | null {
    const raw = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const id = raw ? Number(raw) : NaN;
    return Number.isNaN(id) ? null : id;
  }

  // تطبيق الصلاحية الحقيقية: المالك الفعلي للمنشور أو الـ Admin فقط من يملك الصلاحية
  canManagePost(post: any): boolean {
    return this.isAdmin || (post.reporterUserId != null && post.reporterUserId === this.currentUserId);
  }

  editReport(post: any) {
    this.editingReport = post;
    this.modalMode = post.type || 'lost';
    this.reportForm = {
      petType: post.petType || 'Dog',
      breed: post.breed || '',
      color: post.color || '',
      dateLastSeen: post.dateLastSeen ? new Date(post.dateLastSeen).toISOString().substring(0, 10) : '',
      location: post.location || '',
      description: post.description || '',
      photoName: post.image ? 'Current image' : null,
      reporterName: post.reporterName || '',
      phone: post.phone || ''
    };
    this.reportImageFile = null;
    this.reportModalVisible = true;
  }

  deleteReport(post: any) {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    this.lostFoundService.deleteReport(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter((p) => p.id !== post.id);
        this.cdr.detectChanges();
        alert('Deleted successfully from Database!');
      },
      error: (err) => {
        console.error('Delete lost & found report failed:', err);
        alert('Failed to delete from database! Check Console. Error: ' + (err.error?.message || err.statusText));
      }
    });
  }

  openReport(mode: 'lost' | 'found') {
    this.modalMode = mode;
    this.reportForm = this.emptyReport();
    this.reportModalVisible = true;
  }

  closeReport() {
    this.reportModalVisible = false;
    this.editingReport = null;
    this.reportImageFile = null;
  }

  onModalPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.reportForm.photoName = file.name;
      this.reportImageFile = file;
    }
  }

  submitReport() {
    if (!this.auth.isLoggedIn$.value) {
      this.router.navigate(['/login'], { queryParams: { redirect: 'lost-found' } });
      return;
    }

    const formData = new FormData();
    formData.append('Type', this.modalMode);
    formData.append('PetType', this.reportForm.petType);
    formData.append('Breed', this.reportForm.breed || '');
    formData.append('ColorMarkings', this.reportForm.color || '');
    formData.append('DateLastSeen', this.reportForm.dateLastSeen || new Date().toISOString());
    formData.append('Location', this.reportForm.location || '');
    formData.append('Description', this.reportForm.description || '');
    formData.append('ReporterName', this.reportForm.reporterName || '');
    formData.append('ReporterPhone', this.reportForm.phone || '');

    if (this.reportImageFile) {
      formData.append('ImageFile', this.reportImageFile);
    }

    const request = this.editingReport
      ? this.lostFoundService.updateReport(this.editingReport.id, formData)
      : this.lostFoundService.createReport(formData);

    request.subscribe({
      next: () => {
        alert('Saved successfully to Database!');
        this.closeReport();
        this.loadPosts(); 
      },
      error: (err) => {
        console.error('Lost & Found submit failed:', err);
        alert('Failed to save changes to database! Error: ' + err.statusText);
      }
    });
  }
}