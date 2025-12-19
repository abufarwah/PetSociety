import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Auth {
 isLoggedIn$ = new BehaviorSubject<boolean>(false);

  login() {
    console.log('LOGIN CALLED');
    this.isLoggedIn$.next(true);
  }

  logout() {
    this.isLoggedIn$.next(false);
  }
  
}
