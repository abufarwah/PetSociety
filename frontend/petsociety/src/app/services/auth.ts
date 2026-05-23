import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Auth {
 
   isLoggedIn$ = new BehaviorSubject<boolean>(false);

  constructor() {
    const storedSession = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('isLoggedIn') : null;
    const storedLocal = typeof localStorage !== 'undefined' ? localStorage.getItem('isLoggedIn') : null;
    if (storedSession === 'true' || storedLocal === 'true') {
      this.isLoggedIn$.next(true);
    }
  }


login() {
    this.isLoggedIn$.next(true);
    try {
      sessionStorage.setItem('isLoggedIn', 'true');
    } catch {}
    try {
      localStorage.setItem('isLoggedIn', 'true');
    } catch {}
  }

  logout() {
    this.isLoggedIn$.next(false);
    try {
      sessionStorage.removeItem('isLoggedIn');
    } catch {}
    try {
      localStorage.removeItem('isLoggedIn');
    } catch {}
  }
}
