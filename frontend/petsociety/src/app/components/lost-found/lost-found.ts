import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core'; // 1. أضفنا ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  // 2. يجب إضافة constructor لاستخدام كاشف التغييرات
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
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
      this.searchResultMessage = 'تم الانتهاء من المقارنة بالذكاء الاصطناعي بنجاح! نسبة التطابق: ' + 
        (data.matches && data.matches.length > 0 ? (data.matches[0].confidence * 100) + '%' : 'غير معروف');
      this.cdr.detectChanges();
    })
    .catch(error => {
      console.error('Error connecting to AI service:', error);
      this.searchResultMessage = 'تم رفع الصورة ولكن لم يتم الاتصال بالخدمة الخلفية للذكاء الاصطناعي.';
      this.cdr.detectChanges();
    });
  }

  // --- Real DB Posts Loading ---
  loadPosts() {
    fetch('https://localhost:4200/api/Ai/posts')
      .then(response => {
        if (!response.ok) throw new Error('Could not fetch posts');
        return response.json();
      })
      .then(data => {
        this.posts = data.map((p: any) => ({
          id: p.id,
          type: p.type,
          title: p.title,
          species: p.species,
          excerpt: p.description,
          location: p.location,
          dateText: p.dateText,
          image: p.imageUrl,
          phone: p.phone
        }));
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error('Error loading posts:', error);
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

  openReport(mode: 'lost' | 'found') {
    this.modalMode = mode;
    this.reportForm = this.emptyReport();
    this.reportModalVisible = true;
  }

  closeReport() {
    this.reportModalVisible = false;
  }

  onModalPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.reportForm.photoName = file.name;
    }
  }

  submitReport() {
    const formData = new FormData();
    formData.append('Type', this.modalMode);
    formData.append('Title', this.reportForm.breed || (this.modalMode === 'lost' ? 'Lost Pet' : 'Found Pet'));
    formData.append('Species', this.reportForm.petType);
    formData.append('Description', this.reportForm.description || '');
    formData.append('Location', this.reportForm.location || '');
    formData.append('DateText', this.reportForm.dateLastSeen || new Date().toLocaleDateString());
    formData.append('Phone', this.reportForm.phone || '');
    
    // In a real scenario, you'd bind a file input from the modal here
    // For now we mock it with the main query file if it exists, or fail
    if (this.queryImageFile) {
        formData.append('image', this.queryImageFile);
    } else {
        alert("Please select a pet image first from the top of the page to add a report.");
        return;
    }

    fetch('https://localhost:4200/api/Ai/add-post', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
       console.log('Post Added:', data);
       this.closeReport();
       this.loadPosts(); // refresh from DB
    })
    .catch(err => {
      console.error('Add Post Error:', err);
    });
  }
}
