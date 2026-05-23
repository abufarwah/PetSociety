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


  lostImageName: string | null = null;
  foundImageName: string | null = null;

  lostImagePreview: string | ArrayBuffer | null = null;
foundImagePreview: string | ArrayBuffer | null = null;

  // متغيرات العدادات
  lostCount: number = 0;
  foundCount: number = 0;
  reunitedCount: number = 0;

  @ViewChild('lostInput') lostInputVariable!: ElementRef;
  @ViewChild('foundInput') foundInputVariable!: ElementRef;

  // 2. يجب إضافة constructor لاستخدام كاشف التغييرات
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // تشغيل العدادات
    this.startCounter('lostCount', 120);
    this.startCounter('foundCount', 85);
    this.startCounter('reunitedCount', 50);
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
  onFileSelected(event: any, type: string) {

  const file = event.target.files[0];

  if (file) {

    const reader = new FileReader();

    reader.onload = () => {

      if (type === 'lost') {

        this.lostImageName = file.name;
        this.lostImagePreview = reader.result;

      } else {

        this.foundImageName = file.name;
        this.foundImagePreview = reader.result;

      }

      this.cdr.detectChanges();

    };

    reader.readAsDataURL(file);

  }

}

  clearImages() {

  this.lostImageName = null;
  this.foundImageName = null;

  this.lostImagePreview = null;
  this.foundImagePreview = null;

  if (this.lostInputVariable)
    this.lostInputVariable.nativeElement.value = '';

  if (this.foundInputVariable)
    this.foundInputVariable.nativeElement.value = '';

}

  // Community Reports data and helpers
  viewFilter: 'all' | 'lost' | 'found' = 'all';
  animalFilter: string = 'All Animals';
  animals: string[] = ['All Animals', 'Dog', 'Cat', 'Rabbit', 'Hamster', 'Bird', 'Turtle'];

  selectedContactPostId: number | null = null;
  selectedContactPhone: string | null = null;

  posts: Array<any> = [
    {
      id: 1,
      type: 'lost',
      title: 'Golden Retriever',
      species: 'Dog · Golden / cream',
      excerpt: 'Went missing near Abdoun bridge. Has a red collar with a small tag. Very friendly.',
      location: 'Abdoun, Amman',
      dateText: 'Last seen 18 May 2025',
      image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=1200&q=80',
      phone: '+962 79 123 4567'
    },
    {
      id: 2,
      type: 'found',
      title: 'Tabby',
      species: 'Cat · Brown & black stripes',
      excerpt: 'Found near the Sweifieh roundabout. Seems well-fed and friendly, probably someone\'s pet.',
      location: 'Sweifieh, Amman',
      dateText: 'Found on 19 May 2025',
      image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&q=80',
      phone: '+962 79 234 5678'
    },
    {
      id: 3,
      type: 'lost',
      title: 'Persian',
      species: 'Cat · White & grey',
      excerpt: '2-year-old Persian cat, shy and may be hiding. Last seen near the park in Khalda.',
      location: 'Khalda, Amman',
      dateText: 'Last seen 17 May 2025',
      image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&q=80',
      phone: '+962 79 345 6789'
    }
  ];

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
    // minimal client-side submission: add to local posts list
    const newPost = {
      id: Date.now(),
      type: this.modalMode,
      title: this.reportForm.breed || (this.modalMode === 'lost' ? 'Lost Pet' : 'Found Pet'),
      species: this.reportForm.petType,
      excerpt: this.reportForm.description || '',
      location: this.reportForm.location || '',
      dateText: this.reportForm.dateLastSeen || new Date().toLocaleDateString(),
      image: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=1200&q=80'
    };
    this.posts.unshift(newPost);
    this.closeReport();
  }
}