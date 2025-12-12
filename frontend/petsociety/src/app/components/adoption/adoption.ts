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
    location: 'Amman',
    age: '2 years',
    image: 'd1.jpg',
    tags: ['Friendly', 'Vaccinated'],
  },
  {
    name: 'Luna',
    type: 'Cat',
    location: 'Amman',
    age: '1 year',
    image: 'c1.jpg',
    tags: ['Playful', 'Indoor'],
  },
  {
    name: 'Snow',
    type: 'Rabbit',
    location: 'Amman',
    age: '1 year',
    image: 'r3.jpg',
    tags: ['Cute'],
  },
  {
    name: 'Kiwi',
    type: 'Bird',
    location: 'Amman',
    age: '1 year',
    image: 'bbb.jpg',
    tags: ['Colorful', 'Friendly'],
  },
  {
    name: 'Rocky',
    type: 'Dog',
    location: 'Zarqa',
    age: '4 years',
    image: 'd2.jpg',
    tags: ['Trained', 'Calm'],
  },
  {
    name: 'Peanut',
    type: 'Hamster',
    location: 'Zarqa',
    age: '6 months',
    image: 'h1.jpg',
    tags: ['Small', 'Cute'],
  },
  {
    name: 'Milo',
    type: 'Cat',
    location: 'Salt',
    age: '3 years',
    image: 'c2.jpg',
    tags: ['Calm'],
  },
  {
    name: 'Shelly',
    type: 'Turtle',
    location: 'Amman',
    age: '5 years',
    image: 'tt.jpg',
    tags: ['Quiet', 'Easy Care'],
  },
  {
    name: 'Buddy',
    type: 'Dog',
    location: 'Irbid',
    age: '1 year',
    image: 'd3.jpg',
    tags: ['Energetic'],
  },
  {
    name: 'Bubbles',
    type: 'Fish',
    location: 'Amman',
    age: '8 months',
    image: 'f1.jpg',
    tags: ['Quiet', 'Easy Care'],
  },
  {
    name: 'Cotton',
    type: 'Rabbit',
    location: 'Madaba',
    age: '2 years',
    image: 'r2.jpg',
    tags: ['Calm'],
  },
  {
    name: 'Kiwi',
    type: 'Bird',
    location: 'Amman',
    age: '1 year',
    image: 'bb.jpg',
    tags: ['Friendly'],
  },
  {
    name: 'Nala',
    type: 'Cat',
    location: 'Aqaba',
    age: '2 years',
    image: 'c3.jpg',
    tags: ['Sweet'],
  },
  {
    name: 'Snow',
    type: 'Rabbit',
    location: 'Amman',
    age: '1 year',
    image: 'r1.jpg',
    tags: ['Cute'],
  },
  {
    name: 'Luna',
    type: 'Cat',
    location: 'Amman',
    age: '1 year',
    image: 'c4.jpg',
    tags: ['Playful'],
  },
  {
    name: 'Peanut',
    type: 'Hamster',
    location: 'Zarqa',
    age: '6 months',
    image: 'h2.jpg',
    tags: ['Small', 'Cute'],
  },
  {
    name: 'Milo',
    type: 'Cat',
    location: 'Salt',
    age: '2 years',
    image: 'c5.jpg',
    tags: ['Calm'],
  },
  {
    name: 'Fluffy',
    type: 'Rabbit',
    location: 'Karak',
    age: '1 year',
    image: 'r5.jpg',
    tags: ['Friendly'],
  },
];

// ngOnInit() {
//     this.pets = this.pets.sort(() => Math.random() - 0.5);
//   } // => عشان اخربط الحيوانات
  openPostModal() {
    console.log('CLICKED');
    this.showPostModal = true;
  }

  closePostModal() {
    this.showPostModal = false;
  }
}
