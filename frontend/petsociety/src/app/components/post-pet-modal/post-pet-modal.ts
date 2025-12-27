import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-pet-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-pet-modal.html',
  styleUrls: ['./post-pet-modal.css'],
})
export class PostPetModalComponent {
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;

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
    const newPet = {
      breed: 'New Pet',
      type: 'Dog',
      age: 'Baby',
      location: 'Amman',
      image: this.imagePreview,
      tags: [],
    };

    this.petCreated.emit(newPet);
    this.close.emit();
  }
}
