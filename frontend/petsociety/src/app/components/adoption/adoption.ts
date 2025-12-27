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
  showConfirm = false;
  selectedPet: any = null;
  successType: 'add' | 'adopt' | null = null;
  selectedType: string = 'All';
  selectedAge: string = 'All';
  selectedTag: string = 'All';

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

  pets = [
    {
      breed: 'Toy Poodle',
      type: 'Dog',
      location: 'Karak',
      age: 'Adult',
      image: 'd3.jpg',
      tags: ['Calm', 'Friendly'],
    },
    {
      breed: 'Australian Shepherd',
      type: 'Dog',
      location: 'Amman',
      age: 'Baby',
      image: 'd2.jpg',
      tags: ['Smart', 'Active'],
    },
    {
      breed: 'Domestic Shorthair',
      type: 'Cat',
      location: 'Amman',
      age: 'Baby',
      image: 'c2.jpg',
      tags: ['Playful', 'Curious'],
    },
    {
      breed: 'Boston Terrier',
      type: 'Dog',
      location: 'Irbid',
      age: 'Baby',
      image: 'd1.jpg',
      tags: ['Friendly', 'Playful'],
    },
    {
      breed: 'Domestic Shorthair',
      type: 'Cat',
      location: 'Amman',
      age: 'Baby',
      image: 'c1.jpg',
      tags: ['Cute', 'Calm'],
    },
    {
      breed: 'Scottish Fold',
      type: 'Cat',
      location: 'Amman',
      age: 'Baby',
      image: 'cat1.jpeg',
      tags: ['Quiet', 'Sweet'],
    },
    {
      breed: 'Golden Retriever',
      type: 'Dog',
      location: 'Jarash',
      age: 'Baby',
      image: 'dog1.jpeg',
      tags: ['Friendly', 'Loyal'],
    },
    {
      breed: 'Syrian Hamster',
      type: 'Hamster',
      location: 'Zarqa',
      age: 'Baby',
      image: 'ham1.jpeg',
      tags: ['Small', 'Cute'],
    },
    {
      breed: 'Budgerigar',
      type: 'Bird',
      location: 'Madapa',
      age: 'Adult',
      image: 'bird1.jpeg',
      tags: ['Colorful', 'Friendly'],
    },
    {
      breed: 'Scottish Fold',
      type: 'Cat',
      location: 'Amman',
      age: 'Baby',
      image: 'cat2.jpeg',
      tags: ['Playful', 'Cute'],
    },
    {
      breed: 'Domestic Rabbit',
      type: 'Rabbit',
      location: 'Amman',
      age: 'Adult',
      image: 'rabbit2.jpeg',
      tags: ['Calm', 'Soft'],
    },
    {
      breed: 'Goldfish',
      type: 'Fish',
      location: 'Aqaba',
      age: 'Adult',
      image: 'fish.jpeg',
      tags: ['Quiet', 'Easy Care'],
    },
    {
      breed: 'Golden Retriever',
      type: 'Dog',
      location: 'Amman',
      age: 'Baby',
      image: 'dog2.jpeg',
      tags: ['Playful', 'Friendly'],
    },
    {
      breed: 'Red-Eared Slider',
      type: 'Turtle',
      location: 'Amman',
      age: 'Baby',
      image: 'turt1.jpeg',
      tags: ['Quiet', 'Unique'],
    },
    {
      breed: 'Scottish Fold',
      type: 'Cat',
      location: 'Amman',
      age: 'Adult',
      image: 'cat4.jpeg',
      tags: ['Cute', 'Lazy'],
    },
    {
      breed: 'Budgerigar', 
      type: 'Bird',
      location: 'Karak',
      age: 'Adult',
      image: 'bird2.jpeg',
      tags: ['Talkative', 'Cute'],
    },
    {
      breed: 'Wild Rabbit',
      type: 'Rabbit',
      location: 'Amman',
      age: 'Adult',
      image: 'r4.jpg',
      tags: ['Fast', 'Alert'],
    },
    {
      breed: 'European Hamster',
      type: 'Hamster',
      location: 'Amman',
      age: 'Adult',
      image: 'h1.jpg',
      tags: ['Rare', 'Cute'],
    },
    {
      breed: 'British Shorthair',
      type: 'Cat',
      location: 'Amman',
      age: 'Baby',
      image: 'c5.jpg',
      tags: ['Fluffy', 'Calm'],
    },
    {
      breed: 'British Shorthair',
      type: 'Cat',
      location: 'Zarqa',
      age: 'Baby',
      image: 'cat5.jpeg',
      tags: ['Cute', 'Quiet'],
    },
    {
      breed: 'Mixed Hamster',
      type: 'Hamster',
      location: 'Amman',
      age: 'Baby',
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

  get filteredPets() {
    return this.pets.filter((pet) => {
      const matchType = this.selectedType === 'All' || pet.type === this.selectedType;

      const matchAge = this.selectedAge === 'All' || pet.age === this.selectedAge;

      const matchTag = this.selectedTag === 'All' || pet.tags.includes(this.selectedTag);

      return matchType && matchAge && matchTag;
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
  }

  closePet() {
    this.selectedPet = null;
  }

  confirmAdoption() {
  this.successType = 'adopt';
  this.showConfirm = true;
}


  closeConfirm() {
  this.showConfirm = false;
  this.successType = null;
  this.selectedPet = null;
}


  addPet(pet: any) {
  this.pets.unshift(pet);
  this.showPostModal = false;
  this.successType = 'add';
  this.showConfirm = true;
}

}
