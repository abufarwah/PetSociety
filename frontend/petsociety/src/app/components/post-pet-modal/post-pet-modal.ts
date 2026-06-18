import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-pet-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-pet-modal.html',
  styleUrls: ['./post-pet-modal.css'],
})
export class PostPetModalComponent implements OnChanges {
  @Input() pet: any | null = null;

  imagePreview: string | null = null;
  selectedImageFile: File | null = null;

  petAgeYears: number | null = null;
  petGender: string = '';
  petName: string = '';
  petType: string = '';
  petDescription: string = '';
  isSubmitted = false;

  ownerPhone: string = '';
  handoverMethod: 'Delivery' | 'Clinic Pickup' = 'Clinic Pickup';
  ownerGovernorate: string = '';

  private readonly jordanPhonePattern = /^(?:\+9627|07)(?:7|8|9)\d{7}$/;

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

  selectedTags: string[] = [];

  calculateAgeCategory(ageYears: number): string {
    if (ageYears < 1) return 'Baby';
    if (ageYears < 3) return 'Young';
    return 'Adult';
  }

  toggleTag(tag: string) {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter((t) => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
  }

  isValidJordanPhone(): boolean {
    return this.jordanPhonePattern.test(this.ownerPhone);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pet']) {
      if (this.pet) {
        this.loadPet(this.pet);
      } else {
        this.resetForm();
      }
    }
  }

loadPet(pet: any) {
  this.petName = pet.breed || '';
  this.petType = pet.type || '';
  this.petAgeYears = pet.ageYears ?? null;
  this.petGender = pet.gender || '';
  this.petDescription = pet.description || '';
  this.selectedTags = pet.tags ? [...pet.tags] : [];
  this.selectedImageFile = null;
  this.imagePreview = pet.image || pet.imageUrl || '';
  this.ownerPhone = pet.ownerPhone ?? pet.ownerPhoneNumber ?? pet.OwnerPhoneNumber ?? pet.OwnerPhone ?? '';
  this.handoverMethod = pet.handoverMethod ?? pet.HandoverMethod ?? 'Clinic Pickup';
  this.ownerGovernorate = pet.ownerGovernorate ?? pet.governorate ?? pet.Governorate ?? pet.OwnerGovernorate ?? '';
  
  this.isSubmitted = false;
}

  resetForm() {
    this.petName = '';
    this.petType = '';
    this.petAgeYears = null;
    this.petGender = '';
    this.petDescription = '';
    this.selectedTags = [];
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.ownerPhone = '';
    this.handoverMethod = 'Clinic Pickup';
    this.ownerGovernorate = '';
    this.isSubmitted = false;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  @Output() close = new EventEmitter<void>();
  @Output() petCreated = new EventEmitter<any>();

  submitPet() {
    this.isSubmitted = true;

    const isEditing = !!this.pet?.id;

    if (
      !this.petName ||
      !this.petType ||
      this.petAgeYears === null ||
      !this.petGender ||
      (!this.imagePreview && !isEditing) ||
      !this.isValidJordanPhone() ||
      (this.handoverMethod === 'Delivery' && !this.ownerGovernorate)
    ) {
      return;
    }

    const ageCategory = this.calculateAgeCategory(this.petAgeYears);

    const newPet = {
      id: this.pet?.id,
      breed: this.petName,
      type: this.petType,
      age: ageCategory,
      ageYears: this.petAgeYears,
      ageCategory: ageCategory,
      gender: this.petGender,
      description: this.petDescription,
      image: this.imagePreview,
      imageFile: this.selectedImageFile,
      tags: this.selectedTags,
      isAvailable: true,
      
      ownerPhone: this.ownerPhone,
      handoverMethod: this.handoverMethod,
      ownerGovernorate: this.handoverMethod === 'Delivery' ? this.ownerGovernorate : 'Clinic'
    };

    this.petCreated.emit(newPet);
    this.close.emit();
  }
}