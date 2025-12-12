import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostPetModalComponent } from '../post-pet-modal/post-pet-modal';

@Component({
  selector: 'app-adoption',
  standalone: true,
  imports: [CommonModule, PostPetModalComponent],
  templateUrl: './adoption.html',
  styleUrls: ['./adoption.css'],
})
export class Adoption {

  showPostModal = false;

  pets = [
    {
      name: 'Max',
      type: 'Dog',
      location: 'Los Angeles, CA',
      age: '2 years',
      image: 'assets/dog1.jpg',
      tags: ['Vaccinated', 'Friendly', 'Good with kids'],
    },
    {
      name: 'Luna',
      type: 'Cat',
      location: 'San Francisco, CA',
      age: '1 year',
      image: 'assets/cat1.jpg',
      tags: ['Vaccinated', 'Playful', 'Indoor'],
    },
  ];

  openPostModal() {
    console.log('CLICKED');
    this.showPostModal = true;
  }

  closePostModal() {
    this.showPostModal = false;
  }
}
