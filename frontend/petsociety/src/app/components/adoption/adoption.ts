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
  selectedAge: string = 'All';
  selectedGender: string = 'All';
  selectedTag: string = 'All';
  adopterPhone: string = '';
  adopterDeliveryMethod: 'Delivery' | 'Clinic Pickup' = 'Delivery';
  adoptionError: string = '';
  isLoggedIn = false;
  isAdmin = false;
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

  // pets = [
  //   {
  //     breed: 'Toy Poodle',
  //     type: 'Dog',
  //     age: 'Adult',
  //     ageYears: 3,
  //     gender: 'Female',
  //     image: 'd3.jpg',
  //     tags: ['Calm', 'Friendly'],
  //   },
  //   {
  //     breed: 'Australian Shepherd',
  //     type: 'Dog',
  //     age: 'Baby',
  //     ageYears: 0.8,
  //     gender: 'Male',
  //     image: 'd2.jpg',
  //     tags: ['Smart', 'Active'],
  //   },
  //   {
  //     breed: 'Domestic Shorthair',
  //     type: 'Cat',
  //     age: 'Baby',
  //     ageYears: 0.7,
  //     gender: 'Female',
  //     image: 'c2.jpg',
  //     tags: ['Playful', 'Curious'],
  //   },
  //   {
  //     breed: 'Boston Terrier',
  //     type: 'Dog',
  //     age: 'Baby',
  //     ageYears: 1,
  //     gender: 'Male',
  //     image: 'd1.jpg',
  //     tags: ['Friendly', 'Playful', 'Security'],
  //   },
  //   {
  //     breed: 'Domestic Shorthair',
  //     type: 'Cat',
  //     age: 'Baby',
  //     ageYears: 0.5,
  //     gender: 'Female',
  //     image: 'c1.jpg',
  //     tags: ['Cute', 'Calm'],
  //   },
  //   {
  //     breed: 'Scottish Fold',
  //     type: 'Cat',
  //     age: 'Baby',
  //     ageYears: 1,
  //     gender: 'Female',
  //     image: 'cat1.jpeg',
  //     tags: ['Quiet', 'Sweet'],
  //   },
  //   {
  //     breed: 'Golden Retriever',
  //     type: 'Dog',
  //     age: 'Baby',
  //     ageYears: 0.9,
  //     gender: 'Male',
  //     image: 'dog1.jpeg',
  //     tags: ['Friendly', 'Loyal'],
  //   },
  //   {
  //     breed: 'Syrian Hamster',
  //     type: 'Hamster',
  //     age: 'Baby',
  //     ageYears: 0.4,
  //     gender: 'Female',
  //     image: 'ham1.jpeg',
  //     tags: ['Small', 'Cute'],
  //   },
  //   {
  //     breed: 'Budgerigar',
  //     type: 'Bird',
  //     age: 'Young',
  //     ageYears: 2,
  //     gender: 'Male',
  //     image: 'bird1.jpeg',
  //     tags: ['Colorful', 'Friendly', 'Security'],
  //   },
  //   {
  //     breed: 'Scottish Fold',
  //     type: 'Cat',
  //     age: 'Baby',
  //     ageYears: 0.8,
  //     gender: 'Female',
  //     image: 'cat2.jpeg',
  //     tags: ['Playful', 'Cute'],
  //   },
  //   {
  //     breed: 'Domestic Rabbit',
  //     type: 'Rabbit',
  //     age: 'Adult',
  //     ageYears: 4,
  //     gender: 'Female',
  //     image: 'rabbit2.jpeg',
  //     tags: ['Calm', 'Soft'],
  //   },
  //   {
  //     breed: 'Goldfish',
  //     type: 'Fish',
  //     age: 'Adult',
  //     ageYears: 1,
  //     gender: 'Male',
  //     image: 'fish.jpeg',
  //     tags: ['Quiet', 'Easy Care'],
  //   },
  //   {
  //     breed: 'Golden Retriever',
  //     type: 'Dog',
  //     age: 'Baby',
  //     ageYears: 0.8,
  //     gender: 'Female',
  //     image: 'dog2.jpeg',
  //     tags: ['Playful', 'Friendly'],
  //   },
  //   {
  //     breed: 'Red-Eared Slider',
  //     type: 'Turtle',
  //     age: 'Baby',
  //     ageYears: 0.7,
  //     gender: 'Male',
  //     image: 'turt1.jpeg',
  //     tags: ['Quiet', 'Unique'],
  //   },
  //   {
  //     breed: 'Scottish Fold',
  //     type: 'Cat',
  //     age: 'Adult',
  //     ageYears: 3,
  //     gender: 'Male',
  //     image: 'cat4.jpeg',
  //     tags: ['Cute', 'Lazy'],
  //   },
  //   {
  //     breed: 'Budgerigar', 
  //     type: 'Bird',
  //     age: 'Adult',
  //     ageYears: 2,
  //     gender: 'Female',
  //     image: 'bird2.jpeg',
  //     tags: ['Talkative', 'Cute'],
  //   },
  //   {
  //     breed: 'Wild Rabbit',
  //     type: 'Rabbit',
  //     age: 'Adult',
  //     ageYears: 2,
  //     gender: 'Male',
  //     image: 'r4.jpg',
  //     tags: ['Fast', 'Alert'],
  //   },
  //   {
  //     breed: 'European Hamster',
  //     type: 'Hamster',
  //     age: 'Adult',
  //     ageYears: 1.5,
  //     gender: 'Female',
  //     image: 'h1.jpg',
  //     tags: ['Rare', 'Cute'],
  //   },
  //   {
  //     breed: 'British Shorthair',
  //     type: 'Cat',
  //     age: 'Baby',
  //     ageYears: 0.9,
  //     gender: 'Female',
  //     image: 'c5.jpg',
  //     tags: ['Fluffy', 'Calm'],
  //   },
  //   {
  //     breed: 'British Shorthair',
  //     type: 'Cat',
  //     age: 'Baby',
  //     ageYears: 1,
  //     gender: 'Male',
  //     image: 'cat5.jpeg',
  //     tags: ['Cute', 'Quiet'],
  //   },
  //   {
  //     breed: 'Mixed Hamster',
  //     type: 'Hamster',
  //     age: 'Baby',
  //     ageYears: 0.5,
  //     gender: 'Male',
  //     image: 'ham3.jpeg',
  //     tags: ['Small', 'Cute', 'Active'],
  //   },
  // ];

  pets: any[] = [];
  filteredPetsList: any[] = [];


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
    return this.pets.filter((pet) => {
      const matchType = this.selectedType === 'All' || pet.type === this.selectedType;
      const matchAge = this.selectedAge === 'All' || pet.age === this.selectedAge;
      const matchGender = this.selectedGender === 'All' || pet.gender === this.selectedGender;
      const matchTag = this.selectedTag === 'All' || pet.tags.includes(this.selectedTag);

      return matchType && matchAge && matchGender && matchTag;
    });
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
    this.selectedPet = pet;
    this.showAdoptionDetails = false;
    this.adoptionError = '';
    this.adopterPhone = '';
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
    this.adopterDeliveryMethod = 'Delivery';
    this.showAdoptionDetails = true;
  }

  submitAdoptionRequest() {
    this.adoptionError = '';

    if (!this.adopterPhone.trim()) {
      this.adoptionError = 'Please provide your phone number to continue.';
      return;
    }

    this.adoptionService.requestAdoption({
      petId: this.selectedPet.id,
      phoneNumber: this.adopterPhone,
      deliveryMethod: this.adopterDeliveryMethod
    }).subscribe({
      next: () => {
        this.showConfirm = true;
        this.successType = 'adopt';
        this.showAdoptionDetails = false;
      },
      error: (err) => {
        console.error('Adoption request failed:', err);
        this.adoptionError = 'Something went wrong while sending your request.';
      }
    });
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
    this.adopterDeliveryMethod = 'Delivery';
    this.adoptionError = '';
  }


//   addPet(pet: any) {
//   this.pets.unshift(pet);
//   this.showPostModal = false;
//   this.successType = 'add';
//   this.showConfirm = true;
// }

addPet(pet: any) {
    const formData = new FormData();

    formData.append('breed', pet.breed);
    formData.append('type', pet.type);
    formData.append('ageYears', pet.ageYears.toString()); // ✅ مهم
    formData.append('ageCategory', pet.ageCategory || pet.age || 'Adult');
    formData.append('gender', pet.gender);
    formData.append('description', pet.description || '');

    if (pet.imageFile) {
      formData.append('image', pet.imageFile);
    }

    // Append tags as indexed fields so ASP.NET model binder maps them to List<string>
    if (pet.tags && pet.tags.length) {
      pet.tags.forEach((t: string, i: number) => {
        formData.append(`Tags[${i}]`, t);
      });
    }

    // Ensure pet is available for adoption by default
    formData.append('isAvailable', (pet.isAvailable !== false).toString());

    this.petService.addPet(formData).subscribe({
      next: () => {
        this.loadPets(); // refresh list
        this.showPostModal = false; // 👈 مهم
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

    console.log('Deleting pet with id:', petId);

    this.closeOptionsMenu();

    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    this.petService.deletePet(petId).subscribe({
      next: () => {
        console.log('Pet deleted successfully:', petId);
        this.pets = this.pets.filter((p) => this.getPetId(p) !== petId);
        this.optionsMenuOpenId = null;
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
      // Redirect unauthenticated users to login
      (this as any).router?.navigate(['/login'], { queryParams: { redirect: 'Adoption' } });
      return;
    }

    this.openPet(pet);
  }

  ngOnInit() {
    // Subscribe to auth streams so UI updates immediately on login/logout
    this.auth.isLoggedIn$.subscribe((v: boolean) => {
      this.isLoggedIn = v;
    });
    this.auth.isAdmin$.subscribe((v: boolean) => {
      this.isAdmin = v;
    });

    this.loadPets();
  }

  loadPets() {
    const backendBase = 'https://localhost:44371';

    this.petService.getPets().subscribe({
      next: (res) => {
        this.pets = res
          .map((pet: any) => {
            const imageUrl = pet.image || pet.imageUrl || pet.ImageUrl || '';
            const image = imageUrl.startsWith('/images/')
              ? backendBase + imageUrl
              : imageUrl;

            return {
              ...pet,
              image,
              age: pet.age || pet.ageCategory || pet.AgeCategory,
              tags: pet.tags || pet.Tags || [],
              isAvailable: pet.isAvailable !== false && pet.IsAvailable !== false
            };
          })
          .filter((pet: any) => pet.isAvailable);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading pets:', err);
      }
    });
  }
}

