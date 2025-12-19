import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Auth {
   private userKey = 'user';

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasUser());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  private hasUser(): boolean {
    return !!localStorage.getItem(this.userKey);
  }

  login(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.loggedInSubject.next(true); 
  }

  logout() {
    localStorage.removeItem(this.userKey);
    this.loggedInSubject.next(false);
  }

  getUser() {
    return JSON.parse(localStorage.getItem(this.userKey)!);
  }
  
}
