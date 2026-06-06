import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostPetModalComponent } from '../post-pet-modal/post-pet-modal';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

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
  successType: 'add' | 'adopt' | null = null;
  selectedType: string = 'All';
  selectedAge: string = 'All';
  selectedGender: string = 'All';
  selectedTag: string = 'All';
  adopterPhone: string = '';
  adopterDeliveryMethod: 'Delivery' | 'Clinic Pickup' = 'Delivery';
  adoptionError: string = '';
  isLoggedIn = false;
  constructor(private router: Router, private auth: Auth) {}

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

  pets = [
    {
      breed: 'Toy Poodle',
      type: 'Dog',
      age: 'Adult',
      ageYears: 3,
      gender: 'Female',
      image: 'd3.jpg',
      tags: ['Calm', 'Friendly'],
    },
    {
      breed: 'Australian Shepherd',
      type: 'Dog',
      age: 'Baby',
      ageYears: 0.8,
      gender: 'Male',
      image: 'd2.jpg',
      tags: ['Smart', 'Active'],
    },
    {
      breed: 'Domestic Shorthair',
      type: 'Cat',
      age: 'Baby',
      ageYears: 0.7,
      gender: 'Female',
      image: 'c2.jpg',
      tags: ['Playful', 'Curious'],
    },
    {
      breed: 'Boston Terrier',
      type: 'Dog',
      age: 'Baby',
      ageYears: 1,
      gender: 'Male',
      image: 'd1.jpg',
      tags: ['Friendly', 'Playful', 'Security'],
    },
    {
      breed: 'Domestic Shorthair',
      type: 'Cat',
      age: 'Baby',
      ageYears: 0.5,
      gender: 'Female',
      image: 'c1.jpg',
      tags: ['Cute', 'Calm'],
    },
    {
      breed: 'Scottish Fold',
      type: 'Cat',
      age: 'Baby',
      ageYears: 1,
      gender: 'Female',
      image: 'cat1.jpeg',
      tags: ['Quiet', 'Sweet'],
    },
    {
      breed: 'Golden Retriever',
      type: 'Dog',
      age: 'Baby',
      ageYears: 0.9,
      gender: 'Male',
      image: 'dog1.jpeg',
      tags: ['Friendly', 'Loyal'],
    },
    {
      breed: 'Syrian Hamster',
      type: 'Hamster',
      age: 'Baby',
      ageYears: 0.4,
      gender: 'Female',
      image: 'ham1.jpeg',
      tags: ['Small', 'Cute'],
    },
    {
      breed: 'Budgerigar',
      type: 'Bird',
      age: 'Young',
      ageYears: 2,
      gender: 'Male',
      image: 'bird1.jpeg',
      tags: ['Colorful', 'Friendly', 'Security'],
    },
    {
      breed: 'Scottish Fold',
      type: 'Cat',
      age: 'Baby',
      ageYears: 0.8,
      gender: 'Female',
      image: 'cat2.jpeg',
      tags: ['Playful', 'Cute'],
    },
    {
      breed: 'Domestic Rabbit',
      type: 'Rabbit',
      age: 'Adult',
      ageYears: 4,
      gender: 'Female',
      image: 'rabbit2.jpeg',
      tags: ['Calm', 'Soft'],
    },
    {
      breed: 'Goldfish',
      type: 'Fish',
      age: 'Adult',
      ageYears: 1,
      gender: 'Male',
      image: 'fish.jpeg',
      tags: ['Quiet', 'Easy Care'],
    },
    {
      breed: 'Golden Retriever',
      type: 'Dog',
      age: 'Baby',
      ageYears: 0.8,
      gender: 'Female',
      image: 'dog2.jpeg',
      tags: ['Playful', 'Friendly'],
    },
    {
      breed: 'Red-Eared Slider',
      type: 'Turtle',
      age: 'Baby',
      ageYears: 0.7,
      gender: 'Male',
      image: 'turt1.jpeg',
      tags: ['Quiet', 'Unique'],
    },
    {
      breed: 'Scottish Fold',
      type: 'Cat',
      age: 'Adult',
      ageYears: 3,
      gender: 'Male',
      image: 'cat4.jpeg',
      tags: ['Cute', 'Lazy'],
    },
    {
      breed: 'Budgerigar', 
      type: 'Bird',
      age: 'Adult',
      ageYears: 2,
      gender: 'Female',
      image: 'bird2.jpeg',
      tags: ['Talkative', 'Cute'],
    },
    {
      breed: 'Wild Rabbit',
      type: 'Rabbit',
      age: 'Adult',
      ageYears: 2,
      gender: 'Male',
      image: 'r4.jpg',
      tags: ['Fast', 'Alert'],
    },
    {
      breed: 'European Hamster',
      type: 'Hamster',
      age: 'Adult',
      ageYears: 1.5,
      gender: 'Female',
      image: 'h1.jpg',
      tags: ['Rare', 'Cute'],
    },
    {
      breed: 'British Shorthair',
      type: 'Cat',
      age: 'Baby',
      ageYears: 0.9,
      gender: 'Female',
      image: 'c5.jpg',
      tags: ['Fluffy', 'Calm'],
    },
    {
      breed: 'British Shorthair',
      type: 'Cat',
      age: 'Baby',
      ageYears: 1,
      gender: 'Male',
      image: 'cat5.jpeg',
      tags: ['Cute', 'Quiet'],
    },
    {
      breed: 'Mixed Hamster',
      type: 'Hamster',
      age: 'Baby',
      ageYears: 0.5,
      gender: 'Male',
      image: 'ham3.jpeg',
      tags: ['Small', 'Cute', 'Active'],
    },
  ];
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
    this.showPostModal = true;
  }

  closePostModal() {
    this.showPostModal = false;
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

    this.successType = 'adopt';
    this.showConfirm = true;
    this.showAdoptionDetails = false;
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


  addPet(pet: any) {
  this.pets.unshift(pet);
  this.showPostModal = false;
  this.successType = 'add';
  this.showConfirm = true;
}

handlePostPet() {
  if (!this.isLoggedIn) {
    // Redirect unauthenticated users to login
    (this as any).router?.navigate(['/login'], { queryParams: { redirect: 'Adoption' } });
    return;
  }

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
  // Subscribe to auth stream so UI updates immediately on login/logout
  this.auth.isLoggedIn$.subscribe((v: boolean) => {
    this.isLoggedIn = v;
  });
}

}
