import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-pet-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-pet-modal.html',
  styleUrls: ['./post-pet-modal.css'],
})
export class PostPetModalComponent {
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;

  petAge: string = '';
  petName: string = '';
  petType: string = '';
  petLocation: string = '';
  petDescription: string = '';
  isSubmitted = false;

  availableTags: string[] = [
    'Vaccinated',
    'Friendly',
    'Good with kids',
    'Playful',
    'Calm',
    'Energetic',
    'Indoor',
    'Outdoor',
    'Trained',
  ];

  selectedTags: string[] = [];

  toggleTag(tag: string) {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter((t) => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
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

  if (
    !this.petName ||
    !this.petType ||
    !this.petAge ||
    !this.petLocation ||
    !this.selectedImageFile
  ) {
    return;
  }

  const newPet = {
    breed: this.petName,
    type: this.petType,
    age: this.petAge,
    location: this.petLocation,
    description: this.petDescription,
    image: this.imagePreview,
    tags: this.selectedTags,
  };

  this.petCreated.emit(newPet);
  this.close.emit();
}
}