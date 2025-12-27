import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Auth {
 
   isLoggedIn$ = new BehaviorSubject<boolean>(false);

  constructor() {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('isLoggedIn') : null;
    if (stored === 'true') {
      this.isLoggedIn$.next(true);
    }
  }

  login() {
    this.isLoggedIn$.next(true);
    try {
      localStorage.setItem('isLoggedIn', 'true');
    } catch {}
  }

  logout() {
    this.isLoggedIn$.next(false);
    try {
      localStorage.removeItem('isLoggedIn');
    } catch {}
  }

}


