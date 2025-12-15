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
  @Output() close = new EventEmitter<void>();

  submitPet() {
    alert('Pet posted successfully 🐾'); // مؤقت
    this.close.emit();
  }
}
