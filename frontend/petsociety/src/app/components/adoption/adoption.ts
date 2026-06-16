import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostPetModalComponent } from '../post-pet-modal/post-pet-modal';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { PetService } from '../../services/pet';
import { AdoptionService } from '../../services/adoption';

@Component({
  selector: 'app-adoption',
  standalone: true,
  imports: [CommonModule, FormsModule, PostPetModalComponent],
  templateUrl: './adoption.html',
  styleUrls: ['./adoption.css'],
})
export class Adoption implements OnInit {
  showPostModal = false;
  showConfirm = false;
  showAdoptionDetails = false;
  selectedPet: any = null;
  editingPet: any = null;
  successType: 'add' | 'adopt' | 'edit' | null = null;
  selectedType: string = 'All';
  private readonly jordanPhonePattern = /^(?:\+9627|07)(?:7|8|9)\d{7}$/;
  selectedAge: string = 'All';
  selectedGender: string = 'All';
  selectedTag: string = 'All';
  
  // حقول الطلب
  adopterPhone: string = '';
  adopterGovernorate: string = ''; // ✨ تعريف متغير المحافظة الجديد هنا
  adopterDeliveryMethod: 'Delivery' | 'Clinic Pickup' = 'Delivery';
  
  adoptionError: string = '';
  isLoggedIn = false;
  isAdmin = false;
  currentUserId: number | null = null;
  optionsMenuOpenId: number | null = null;

  constructor(
    private router: Router,
    private auth: Auth,
    private petService: PetService,
    private adoptionService: AdoptionService,
    private cdr: ChangeDetectorRef
  ) {}

  availableTags: string[] = [
    'Vaccinated',
    'Friendly',
    'Good with kids',
    'Playful',
    'Calm',
    'Energetic',
    'Security',
    'Trained',
  ];

  pets: any[] = [];
  filteredPetsList: any[] = [];
  adoptionRequests: any[] = [];
  isLoading = true;
  activeTab: 'all' | 'my-posts' = 'all';

  onTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedType = select.value;
  }

  onAgeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedAge = select.value;
  }

  selectTag(tag: string) {
    this.selectedTag = tag;
  }

  formatAge(ageYears: number) {
    if (ageYears < 1) {
      const months = Math.round(ageYears * 12);
      return `${months} months`;
    }
    const years = Math.round(ageYears);
    return years === 1 ? '1 year' : `${years} years`;
  }

  onGenderChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedGender = select.value;
  }

  get filteredPets() {
    const filtered = this.pets.filter((pet) => {
      const matchType = this.selectedType === 'All' || pet.type === this.selectedType;
      const matchAge = this.selectedAge === 'All' || pet.age === this.selectedAge;
      const matchGender = this.selectedGender === 'All' || pet.gender === this.selectedGender;
      const matchTag = this.selectedTag === 'All' || pet.tags.includes(this.selectedTag);

      return matchType && matchAge && matchGender && matchTag;
    });

    if (this.activeTab === 'my-posts') {
      return filtered.filter(pet => this.isOwner(pet));
    } else {
      return filtered.filter(pet => !this.isOwner(pet));
    }
  }

  openPostModal() {
    this.editingPet = null;
    this.showPostModal = true;
  }

  closePostModal() {
    this.showPostModal = false;
    this.editingPet = null;
  }

  openPet(pet: any) {
    if (this.hasExistingRequest(pet)) {
      return; 
    }
    this.selectedPet = pet;
    this.showAdoptionDetails = false;
    this.adoptionError = '';
    this.adopterPhone = '';
    this.adopterGovernorate = ''; // 👈 تصفير المحافظة عند فتح الكرت
    this.adopterDeliveryMethod = 'Delivery';
  }

  closePet() {
    this.selectedPet = null;
    this.showAdoptionDetails = false;
    this.adoptionError = '';
  }

  openAdoptionRequest() {
    this.adoptionError = '';
    this.adopterPhone = '';
    this.adopterGovernorate = ''; // 👈 تصفير المحافظة عند فتح فورم الطلب
    this.adopterDeliveryMethod = 'Delivery';
    this.showAdoptionDetails = true;
  }

  validatePhoneNumber(phone: string) {
    const normalized = phone.replace(/\s+/g, '');
    return this.jordanPhonePattern.test(normalized);
  }

  submitAdoptionRequest() {
    this.adoptionError = '';
    const phone = this.adopterPhone.trim();
    const governorate = this.adopterGovernorate;

    if (!phone) {
      this.adoptionError = 'Please provide your phone number to continue.';
      return;
    }

    if (!this.validatePhoneNumber(phone)) {
      this.adoptionError = 'Enter a valid Jordanian phone number: 077, 078, 079 or +9627 followed by 7 digits.';
      return;
    }

    // ✨ التحقق من قيام المستخدم باختيار المحافظة من القائمة
    if (!governorate) {
      this.adoptionError = 'Please select your governorate.';
      return;
    }

    if (!this.selectedPet) {
      this.adoptionError = 'Unable to submit request. Please reopen the pet details and try again.';
      return;
    }

    const userEmail = localStorage.getItem('userEmail') || '';

    // إرسال البيانات المحدثة بالكامل شاملة الـ governorate إلى الـ API
    this.adoptionService.requestAdoption({
      petId: this.selectedPet.id,
      phoneNumber: phone,
      governorate: governorate, // ✨ تمرير المحافظة هنا ليرسلها السيرفس للباك إند
      deliveryMethod: this.adopterDeliveryMethod,
      userEmail
    }).subscribe({
      next: () => {
        this.showConfirm = true;
        this.successType = 'adopt';
        this.showAdoptionDetails = false;
        this.loadAdoptionRequests(); 
      },
      error: (err) => {
        console.error('Adoption request failed:', err);
        this.adoptionError = 'Something went wrong while sending your request.';
      }
    });
  }

  startAdoption() {
    this.showAdoptionDetails = true;
  }

  closeAdoptionRequest() {
    this.showAdoptionDetails = false;
    this.adoptionError = '';
  }

  confirmAdoption() {
    this.openAdoptionRequest();
  }

  closeConfirm() {
    this.showConfirm = false;
    this.successType = null;
    this.selectedPet = null;
    this.showAdoptionDetails = false;
    this.adopterPhone = '';
    this.adopterGovernorate = ''; // 👈 تصفير عند إغلاق واجهة النجاح
    this.adopterDeliveryMethod = 'Delivery';
    this.adoptionError = '';
  }

  addPet(pet: any) {
    const formData = new FormData();

    formData.append('breed', pet.breed);
    formData.append('type', pet.type);
    formData.append('ageYears', pet.ageYears.toString()); 
    formData.append('ageCategory', pet.ageCategory || pet.age || 'Adult');
    formData.append('gender', pet.gender);
    formData.append('description', pet.description || '');

    if (pet.imageFile) {
      formData.append('image', pet.imageFile);
    }

    if (pet.tags && pet.tags.length) {
      pet.tags.forEach((t: string, i: number) => {
        formData.append(`Tags[${i}]`, t);
      });
    }

    formData.append('isAvailable', (pet.isAvailable !== false).toString());

    this.petService.addPet(formData).subscribe({
      next: () => {
        this.loadPets(); 
        this.showPostModal = false; 
        this.showConfirm = true;
        this.successType = 'add';
        this.editingPet = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Add pet failed:', err);
      }
    });
  }

  savePet(pet: any) {
    const formData = new FormData();
    if (pet.id) {
      formData.append('id', pet.id.toString());
    }

    formData.append('breed', pet.breed);
    formData.append('type', pet.type);
    formData.append('ageYears', pet.ageYears.toString());
    formData.append('ageCategory', pet.ageCategory || pet.age || 'Adult');
    formData.append('gender', pet.gender);
    formData.append('description', pet.description || '');

    if (pet.imageFile) {
      formData.append('image', pet.imageFile);
    }

    if (pet.tags && pet.tags.length) {
      pet.tags.forEach((t: string, i: number) => {
        formData.append(`Tags[${i}]`, t);
      });
    }

    formData.append('isAvailable', (pet.isAvailable !== false).toString());

    const request = pet.id ? this.petService.updatePet(formData) : this.petService.addPet(formData);
    request.subscribe({
      next: () => {
        this.loadPets();
        this.showPostModal = false;
        this.showConfirm = true;
        this.successType = pet.id ? 'edit' : 'add';
        this.editingPet = null;
        this.optionsMenuOpenId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Save pet failed:', err);
      }
    });
  }

  getPetId(pet: any): number | null {
    const rawId = pet?.id ?? pet?.Id ?? null;
    const parsedId = rawId != null ? Number(rawId) : null;
    return parsedId != null && !Number.isNaN(parsedId) ? parsedId : null;
  }

  getCurrentUserId(): number | null {
    const raw = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const id = raw ? Number(raw) : NaN;
    return Number.isNaN(id) ? null : id;
  }

  canManagePet(pet: any) {
    return this.isAdmin || (pet.userId != null && pet.userId === this.currentUserId);
  }

  editPet(pet: any) {
    this.closeOptionsMenu();
    this.editingPet = { ...pet };
    this.showPostModal = true;
  }

  deletePet(pet: any) {
    const petId = this.getPetId(pet);
    if (petId === null) {
      console.error('Delete pet failed: missing pet id', pet);
      return;
    }

    this.closeOptionsMenu();

    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    this.petService.deletePet(petId).subscribe({
      next: () => {
        this.pets = this.pets.filter((p) => this.getPetId(p) !== petId);
        this.optionsMenuOpenId = null;
        this.cdr.detectChanges();
        this.loadPets();
      },
      error: (err) => {
        console.error('Delete pet failed:', err);
        alert('Delete failed: ' + (err?.message ?? err));
      }
    });
  }

  toggleOptionsMenu(petId: number | null, event: MouseEvent) {
    event.stopPropagation();
    if (petId === null || petId === undefined) {
      return;
    }
    this.optionsMenuOpenId = this.optionsMenuOpenId === petId ? null : petId;
  }

  closeOptionsMenu() {
    this.optionsMenuOpenId = null;
  }

  handlePostPet() {
    this.openPostModal();
  }

  handleAdoption(pet: any) {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { redirect: 'Adoption' } });
      return;
    }

    if (pet.userId != null && pet.userId === this.currentUserId && !this.isAdmin) {
      this.adoptionError = 'You cannot request adoption for your own pet.';
      this.openPet(pet);
      return;
    }

    this.openPet(pet);
  }

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn$.value;
    this.isAdmin = this.auth.isAdmin$.value;

    this.auth.isLoggedIn$.subscribe((v: boolean) => {
      this.isLoggedIn = v;
      this.currentUserId = this.getCurrentUserId();
    });
    this.auth.isAdmin$.subscribe((v: boolean) => {
      this.isAdmin = v;
    });

    this.currentUserId = this.getCurrentUserId();
    this.loadAdoptionRequests();
  }

  loadAdoptionRequests() {
    this.isLoading = true; 
    this.adoptionService.getAll().subscribe({
      next: (res: any) => {
        this.adoptionRequests = res || [];
        this.loadPets(); 
      },
      error: (err) => {
        console.error('Failed to load adoption requests', err);
        this.loadPets();
      }
    });
  }

  loadPets() {
    const backendBase = 'https://localhost:44371';

    this.petService.getPets().subscribe({
      next: (res) => {
        this.pets = res
          .map((pet: any) => {
            const imageUrl = pet.image || pet.imageUrl || pet.ImageUrl || '';
            const image = imageUrl.startsWith('/images/') ? backendBase + imageUrl : imageUrl;
            const petId = this.getPetId(pet) ?? pet.id ?? pet.Id;

            const ownRequest = this.adoptionRequests.find(r => r.petId === petId);
            const isOwner = pet.userId === this.currentUserId;

            return {
              ...pet,
              id: petId,
              userId: pet.userId ?? pet.UserId ?? null,
              status: pet.status || pet.Status || 'Available',
              image,
              age: pet.age || pet.ageCategory || pet.AgeCategory,
              tags: pet.tags || pet.Tags || [],
              isAvailable: pet.isAvailable !== false && pet.IsAvailable !== false,
              
              isCurrentUserOwner: isOwner,
              currentUserRequest: ownRequest, 
              ownerMessage: isOwner && ownRequest ? this.getOwnerAdoptionMessage({ id: petId }) : ''
            };
          })
          .filter((pet: any) => pet.isAvailable);

        this.isLoading = false; 
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading pets:', err);
        this.isLoading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  isOwner(pet: any): boolean {
    return pet.isCurrentUserOwner || false;
  }

  getAdoptionRequest(pet: any) {
    return this.adoptionRequests?.find(r => r.petId === pet.id);
  }

  getOwnerAdoptionMessage(pet: any): string {
    const req = this.adoptionRequests.find(r => r.petId === pet.id);

    if (!req) return '';

    switch (req.status) {
      case 'Pending':
        return '⏳ Pending';
      case 'Approved':
        return '✅ Approved';
      case 'Rejected':
        return '❌ Rejected';
      default:
        return '';
    }
  }

  getMyListingsCount(): number {
    return this.pets.filter(pet => this.isOwner(pet)).length;
  }

  hasExistingRequest(pet: any): boolean {
    if (!pet || !pet.currentUserRequest) return false;
    const status = pet.currentUserRequest.status?.toLowerCase();
    return status === 'pending' || status === 'approved';
  }
}