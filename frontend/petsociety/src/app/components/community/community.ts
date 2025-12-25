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

  newMessage: string = '';

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

  activeChannel = this.channels[0];

 messagesByChannel: any = {
  /* ================= GROUP 1 (10 people) ================= */
  1: [
    {
      user: 'Sarah Johnson',
      text: 'Thanks for the advice! What treats do you recommend?',
      time: '10:31 PM',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      user: 'Alex Rivera',
      text: 'I use small training treats from Pet Society +.',
      time: '10:32 PM',
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg'
    },
    {
      user: 'Liam Brown',
      text: 'Peanut butter treats worked great for us 🐶',
      time: '10:34 PM',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      user: 'Emily Clark',
      text: 'Soft treats are easier for puppies.',
      time: '10:36 PM',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      user: 'Noah Wilson',
      text: 'Consistency is more important than treats honestly.',
      time: '10:38 PM',
      avatar: 'https://randomuser.me/api/portraits/men/52.jpg'
    },
    {
      user: 'Olivia Martin',
      text: 'We started training at 3 months and it helped a lot!',
      time: '10:40 PM',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
    },
    {
      user: 'James Anderson',
      text: 'Short sessions work best.',
      time: '10:42 PM',
      avatar: 'https://randomuser.me/api/portraits/men/61.jpg'
    },
    {
      user: 'Sophia Lee',
      text: 'Avoid treats with too much sugar.',
      time: '10:44 PM',
      avatar: 'https://randomuser.me/api/portraits/women/75.jpg'
    },
    {
      user: 'Daniel Moore',
      text: 'Positive reinforcement changed everything.',
      time: '10:46 PM',
      avatar: 'https://randomuser.me/api/portraits/men/76.jpg'
    },
    {
      user: 'Emma Wilson',
      text: 'High-value treats make a big difference!',
      time: '10:48 PM',
      avatar: 'https://randomuser.me/api/portraits/women/58.jpg'
    }
  ],

  /* ================= GROUP 2 (7 people) ================= */
  2: [
    {
      user: 'Michael Chen',
      text: 'Clicker training worked great with my dog.',
      time: '9:20 PM',
      avatar: 'https://randomuser.me/api/portraits/men/34.jpg'
    },
    {
      user: 'Ryan Scott',
      text: 'Timing the click is super important.',
      time: '9:22 PM',
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg'
    },
    {
      user: 'Hannah White',
      text: 'I struggled at first but it paid off.',
      time: '9:24 PM',
      avatar: 'https://randomuser.me/api/portraits/women/29.jpg'
    },
    {
      user: 'Ethan Walker',
      text: 'Use treats right after the click.',
      time: '9:26 PM',
      avatar: 'https://randomuser.me/api/portraits/men/55.jpg'
    },
    {
      user: 'Grace Hall',
      text: 'Consistency is everything!',
      time: '9:28 PM',
      avatar: 'https://randomuser.me/api/portraits/women/63.jpg'
    },
    {
      user: 'Leo Turner',
      text: 'My dog learned sit in two days 😅',
      time: '9:30 PM',
      avatar: 'https://randomuser.me/api/portraits/men/71.jpg'
    },
    {
      user: 'Mia Adams',
      text: 'Keep sessions short and fun.',
      time: '9:32 PM',
      avatar: 'https://randomuser.me/api/portraits/women/82.jpg'
    }
  ],

  /* ================= GROUP 3 (15 people) ================= */
  3: [
    {
      user: 'Jessica Martinez',
      text: 'Cats need patience more than training 😅',
      time: '8:10 PM',
      avatar: 'https://randomuser.me/api/portraits/women/21.jpg'
    },
    {
      user: 'Oliver King',
      text: 'Every cat has a unique personality.',
      time: '8:12 PM',
      avatar: 'https://randomuser.me/api/portraits/men/18.jpg'
    },
    {
      user: 'Luna Perez',
      text: 'My cat only listens when she wants to.',
      time: '8:14 PM',
      avatar: 'https://randomuser.me/api/portraits/women/39.jpg'
    },
    {
      user: 'Henry Collins',
      text: 'Interactive toys help a lot.',
      time: '8:16 PM',
      avatar: 'https://randomuser.me/api/portraits/men/47.jpg'
    },
    {
      user: 'Ava Brooks',
      text: 'Cats love routine.',
      time: '8:18 PM',
      avatar: 'https://randomuser.me/api/portraits/women/54.jpg'
    },
    {
      user: 'Jack Murphy',
      text: 'Never force a cat to do anything 😂',
      time: '8:20 PM',
      avatar: 'https://randomuser.me/api/portraits/men/64.jpg'
    },
    {
      user: 'Ella Young',
      text: 'Positive reinforcement works with cats too!',
      time: '8:22 PM',
      avatar: 'https://randomuser.me/api/portraits/women/77.jpg'
    },
    {
      user: 'Benjamin Scott',
      text: 'Treats are the only motivation.',
      time: '8:24 PM',
      avatar: 'https://randomuser.me/api/portraits/men/83.jpg'
    },
    {
      user: 'Chloe Green',
      text: 'My cat ignores me most of the time.',
      time: '8:26 PM',
      avatar: 'https://randomuser.me/api/portraits/women/91.jpg'
    },
    {
      user: 'Nathan Reed',
      text: 'Playtime before meals helps behavior.',
      time: '8:28 PM',
      avatar: 'https://randomuser.me/api/portraits/men/90.jpg'
    },
    {
      user: 'Isabella Turner',
      text: 'Laser toys are a lifesaver.',
      time: '8:30 PM',
      avatar: 'https://randomuser.me/api/portraits/women/88.jpg'
    },
    {
      user: 'Lucas Bennett',
      text: 'Scratching posts reduce bad habits.',
      time: '8:32 PM',
      avatar: 'https://randomuser.me/api/portraits/men/92.jpg'
    },
    {
      user: 'Sofia Ramirez',
      text: 'Every cat learns differently.',
      time: '8:34 PM',
      avatar: 'https://randomuser.me/api/portraits/women/95.jpg'
    },
    {
      user: 'Aaron Price',
      text: 'Training cats takes time but it’s worth it.',
      time: '8:36 PM',
      avatar: 'https://randomuser.me/api/portraits/men/97.jpg'
    },
    {
      user: 'Mila Novak',
      text: 'Food puzzles are amazing!',
      time: '8:38 PM',
      avatar: 'https://randomuser.me/api/portraits/women/99.jpg'
    }
  ]
};


  get messages() {
    return this.messagesByChannel[this.activeChannel.id] || [];
  }

  selectChannel(channel: any) {
    this.activeChannel = channel;
  }

  sendMessage() {
    if (this.newMessage.trim() === '') return;

    this.messagesByChannel[this.activeChannel.id].push({
      user: 'You',
      text: this.newMessage,
      time: 'Now',
      avatar: 'assets/images/default-user.png'
    });

    this.newMessage = '';
  }
}
