import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core'; // 1. أضفنا ChangeDetectorRef
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

  // متغيرات العدادات
  lostCount: number = 0;
  foundCount: number = 0;
  reunitedCount: number = 0;

  @ViewChild('queryInput') queryInputVariable!: ElementRef;

  currentUserId: number | null = null;
  isAdmin = false;
  reportImageFile: File | null = null;
  editingReport: any = null;

  // 2. يجب إضافة constructor لاستخدام كاشف التغييرات
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private lostFoundService: LostFoundService,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.currentUserId = this.getCurrentUserId();
    this.auth.isAdmin$.subscribe((v) => {
      this.isAdmin = v;
    });
    this.auth.isLoggedIn$.subscribe(() => {
      this.currentUserId = this.getCurrentUserId();
    });

    // تشغيل العدادات
    this.startCounter('lostCount', 120);
    this.startCounter('foundCount', 85);
    this.startCounter('reunitedCount', 50);

    // Call loadPosts
    this.loadPosts();
  }

  startCounter(prop: 'lostCount' | 'foundCount' | 'reunitedCount', target: number) {
    let current = 0;
    const duration = 2000; // المدة بالمللي ثانية (ثانيتين)
    const steps = 50; // عدد الخطوات
    const increment = target / steps; // مقدار الزيادة
    const stepTime = duration / steps; // الوقت بين كل خطوة

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        this[prop] = target;
        clearInterval(timer);
      } else {
        this[prop] = Math.floor(current);
      }
      
      // 3. هذا هو السطر السحري: "يا أنجولار، حدث الشاشة الآن!"
      this.cdr.detectChanges(); 

    }, stepTime);
  }

  // دوال الصور (كما هي)
  onFileSelected(event: any) {

    const file = event.target.files[0];

    if (file) {

      const reader = new FileReader();

      reader.onload = () => {
        this.queryImageName = file.name;
        this.queryImagePreview = reader.result;
        this.queryImageFile = file;
        this.searchResultMessage = null;
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
  }

  searchSimilarPets() {
    if (!this.queryImageFile) return;

    this.searchResultMessage = 'Analyzing image and searching for matches...';

    const formData = new FormData();
    formData.append('queryImage', this.queryImageFile, this.queryImageFile.name);

    fetch('https://localhost:4200/api/Ai/compare', { 
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
        (data.matches && data.matches.length > 0 ? (data.matches[0].confidence * 100) + '%' : 'unknown');
      this.cdr.detectChanges();
    })
    .catch(error => {
      console.error('Error connecting to AI service:', error);
      this.searchResultMessage = 'Image uploaded but the AI backend service is not reachable.';
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
            reporterUserId: p.reporterUserId,
            status: p.status,
            reporterName: p.reporterName,
            breed: p.breed,
            color: p.colorMarkings,
            description: p.description,
            petType: p.petType,
            dateLastSeen: p.dateLastSeen,
            createdAt: p.createdAt
          };
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading lost & found reports:', err);
      }
    });
  }

  // Community Reports data and helpers
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
    this.selectedContactPhone = post.phone;
  }

  contactFinder(post: any) {
    this.selectedContactPostId = post.id;
    this.selectedContactPhone = post.phone;
  }

  // --- Reporting modal state & handlers ---
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
      },
      error: (err) => {
        console.error('Delete lost & found report failed:', err);
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
        this.closeReport();
        this.loadPosts();
      },
      error: (err) => {
        console.error('Lost & Found submit failed:', err);
      }
    });
  }
}
