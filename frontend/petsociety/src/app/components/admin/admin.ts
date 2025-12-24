import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  // 
  activeTab: string = 'users';

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  // == ---user managment--=====-------
  userSearchText: string = '';
  selectedUser: any = null;

  get filteredUsers() {
    if (!this.userSearchText) {
      return this.users;
    }
    const term = this.userSearchText.toLowerCase();
    return this.users.filter(user => 
      user.name.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term) ||
      user.phone.includes(term)
    );
  }

  viewUser(user: any) {
    this.selectedUser = user;
    setTimeout(() => {
      const element = document.getElementById('userDetails');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  deleteUser(id: number) {
    if(confirm('Are you sure you want to delete this user?')) {
      this.users = this.users.filter(u => u.id !== id);
      this.selectedUser = null; 
    }
  }

  toggleUserStatus(user: any) {
    user.status = user.status === 'Active' ? 'Disabled' : 'Active';
  }

  users = [
    { 
      id: 1, 
      name: 'Besan Awwad', 
      email: 'besoawad1@gmail.com', 
      phone: '+962 79 123 4567', 
      status: 'Active', 
      role: 'Pet Owner',
      petsPosted: 3, 
      subscription: 'Premium Plan', 
      activity: 'Last login: 2 hours ago' 
    },
    { 
      id: 2, 
      name: 'Hashem aldawaimeh', 
      email: 'dawaimehh@gmail.com', 
      phone: '+962 77 987 6543', 
      status: 'Disabled', 
      role: 'User',
      petsPosted: 0, 
      subscription: 'None', 
      activity: 'Last login: 1 month ago' 
    },
    { 
      id: 3, 
      name: 'Rama Asha', 
      email: 'rama123@gmail.com', 
      phone: '+962 78 555 1122', 
      status: 'Active', 
      role: 'Vet',
      petsPosted: 1, 
      subscription: 'Basic Plan', 
      activity: 'Online Now' 
    },
    { 
      id: 4, 
      name: 'Ali Hudaib', 
      email: 'ali.h@gmail.com', 
      phone: '+962 79 000 1111', 
      status: 'Active', 
      role: 'Pet Owner',
      petsPosted: 5, 
      subscription: 'Deluxe Plan', 
      activity: 'Active yesterday' 
    }
  ];


  // ==================== (Subscriptions) ==
  searchText: string = '';

  get filteredSubscriptions() {
    if (!this.searchText) {
      return this.subscriptionsList;
    }
    return this.subscriptionsList.filter(sub => {
      const term = this.searchText.toLowerCase();
      return (sub.user && sub.user.toLowerCase().includes(term)) ||
             (sub.Sarah && sub.Sarah.toLowerCase().includes(term)) ||
             sub.id.toLowerCase().includes(term);
    });
  }

  subsStats = {
    revenue: '$79.97',
    activeCount: 2,
    churnRate: '2.1%'
  };

  subscriptionsList = [
    { id: 'SUB-001', user: 'Tamara Abzakh', plan: 'Deluxe', price: '$28.99/mo', status: 'Active', nextBilling: '2026-03-01' },
    { id: 'SUB-002', Sarah: 'Rana Mofeed', plan: 'Basic', price: '$8.99/mo', status: 'Active', nextBilling: '2026-02-15' },
    { id: 'SUB-003', user: 'Basel Adarbeh', plan: 'Premium', price: '$18.99/mo', status: 'Cancelled', nextBilling: '2026-01-10' },
  ];




  // ✅ 
  planStats = {
    basic: 7,
    premium: 3,
    deluxe: 4
  };

  // ... 


  // ==================  (AI Lost & Found)-----.....
  aiStats = {
    totalReports: 46,
    successfulMatches: 39,
    accuracy: '92%'
  };

  aiReports = [
    { 
      id: 'MATCH-101', 
      reporter: 'Sami Farawneh', 
      matchPercent: 98, 
      status: 'User Confirmed', // المستخدم أكد أنه حيوانه
      lastUpdate: '2 hours ago'
    },
    { 
      id: 'MATCH-102', 
      reporter: 'Layan S.', 
      matchPercent: 92, 
      status: 'Waiting User',   // النظام لقى تطابق وبستنى رد المستخدم
      lastUpdate: '1 day ago'
    },
    { 
      id: 'MATCH-103', 
      reporter: 'Omar K.', 
      matchPercent: 45, 
      status: 'User Rejected',  // المستخدم قال "لا، مش حيواني"
      lastUpdate: '3 days ago'
    }
  ];


  // ==================== طلبات التبني (Adoption Requests) ==
  adoptionRequests = [
    { 
      id: 'REQ-101', 
      pet: 'Golden Retriever (Dog)', 
      applicant: 'kinda alsayed', 
      owner: 'Ali Olwan',          
      date: '2025-12-19', 
      status: 'Waiting Owner'      
    },
    { 
      id: 'REQ-102', 
      pet: 'Maine Coon (Cat)', 
      applicant: 'Nawras Amayreh', 
      owner: 'Malah kh', 
      date: '2025-12-18', 
      status: 'In Discussion'      
    },
    { 
      id: 'REQ-103', 
      pet: 'Holland Lop (Rabbit)', 
      applicant: 'Rawan R.', 
      owner: 'Sami K.', 
      date: '2025-11-17', 
      status: 'Owner Approved'     
    }
  ];


  //  إدارة الشات  (Chat & Community) ====================
  
  chatStats = {
    dailyMessages: 140,
    activeUsers: 45,
    flaggedCount: 12
  };

  bannedUsers = [
    { 
      id: 201, 
      user: 'SpammerX', 
      reason: 'Sharing malicious links', 
      bannedAt: '2024-12-20', 
      duration: 'Permanent',
      status: 'Banned'
    },
    { 
      id: 205, 
      user: 'AngryUser', 
      reason: 'Offensive language', 
      bannedAt: '2024-12-22', 
      duration: '7 Days',
      status: 'Muted'
    },
    { 
      id: 310, 
      user: 'FakeSeller', 
      reason: 'Scam attempt reported', 
      bannedAt: '2024-12-18', 
      duration: '30 Days',
      status: 'Suspended'
    }
  ]; 

  reportedMessages = [
    { 
      id: 'MSG-991', 
      sender: 'SpammerX', 
      content: 'Win a free iPhone now! Click here...', 
      reason: 'Spam', 
      risk: 'High' 
    },
    { 
      id: 'MSG-992', 
      sender: 'AngryUser', 
      content: 'You are stupid and I hate this app', 
      reason: 'Harassment', 
      risk: 'Medium' 
    },
    { 
      id: 'MSG-993', 
      sender: 'Seller123', 
      content: 'Call me on 0799999 for discount', 
      reason: 'Sharing Private Info', 
      risk: 'Low' 
    }
  ];



  //  إحصائيات الداشبورد العلوية ( بتنحسب لحالها)
  get stats() {
    return {
      totalUsers: this.users.length,
      activeUsers: this.users.filter(u => u.status === 'Active').length,
      petsCount: this.adoptionRequests.length, 
      subscribers: this.subscriptionsList.filter(s => s.status === 'Active').length,
      flaggedCount: this.reportedMessages.length
    };
  }



}