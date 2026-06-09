import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Auth {
 
  isLoggedIn$ = new BehaviorSubject<boolean>(false);
  isAdmin$ = new BehaviorSubject<boolean>(false);

  constructor() {
    const storedSession = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('isLoggedIn') : null;
    const storedLocal = typeof localStorage !== 'undefined' ? localStorage.getItem('isLoggedIn') : null;
    const storedSessionAdmin = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('isAdmin') : null;
    const storedLocalAdmin = typeof localStorage !== 'undefined' ? localStorage.getItem('isAdmin') : null;

    if (storedSession === 'true' || storedLocal === 'true') {
      this.isLoggedIn$.next(true);
    }
    if (storedSessionAdmin === 'true' || storedLocalAdmin === 'true') {
      this.isAdmin$.next(true);
    }
  }

  login(email: string) {
    const normalizedEmail = email?.toLowerCase() || '';
    const isAdmin = normalizedEmail.includes('admin');

    this.isLoggedIn$.next(true);
    this.isAdmin$.next(isAdmin);

    try {
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
    } catch {}
    try {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
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
