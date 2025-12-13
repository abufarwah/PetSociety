import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community.html',
  styleUrls: ['./community.css'],
})
export class Community {

  // input message
  newMessage: string = '';

  // channels
  channels = [
    {
      id: 1,
      name: 'New Pet Parents',
      desc: 'Support for first-time owners',
      members: 445,
      icon: '🐾'
    },
    {
      id: 2,
      name: 'Dog Training Tips',
      desc: 'Share training experiences',
      members: 892,
      icon: '🐕'
    },
    {
      id: 3,
      name: 'Cat Lovers Club',
      desc: 'All things cats',
      members: 673,
      icon: '🐱'
    }
  ];

  // active channel
  activeChannel = this.channels[0];

  // messages
 messages = [
  {
    user: 'Sarah Johnson',
    text: 'Thanks for the advice! What treats do you recommend?',
    time: '10:31 PM',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    user: 'Alex Rivera',
    text: 'I use small training treats from Pet Society +. My dog loves them!',
    time: '10:32 PM',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg'
  },
  {
    user: 'Michael Chen',
    text: 'Has anyone tried clicker training? I just started with my puppy.',
    time: '10:35 PM',
    avatar: 'https://randomuser.me/api/portraits/men/34.jpg'
  },
  {
    user: 'Jessica Martinez',
    text: 'Clicker training works great! Consistency is the key.',
    time: '10:38 PM',
    avatar: 'https://randomuser.me/api/portraits/women/21.jpg'
  },
  {
    user: 'Daniel Moore',
    text: 'Short sessions worked best for my dog.',
    time: '10:40 PM',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg'
  },
  {
    user: 'Emma Wilson',
    text: 'High-value treats made a huge difference!',
    time: '10:42 PM',
    avatar: 'https://randomuser.me/api/portraits/women/58.jpg'
  }
];


  // change channel
  selectChannel(channel: any) {
    this.activeChannel = channel;
  }

  // send message
  sendMessage() {
    if (this.newMessage.trim() === '') return;

    this.messages.push({
      user: 'You',
      text: this.newMessage,
      time: 'Now',
      avatar: 'assets/images/default-user.png'
    });

    this.newMessage = '';
  }
}
