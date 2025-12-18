import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private userKey = 'loggedUser';

  login(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem(this.userKey);
  }

  getUser() {
    return JSON.parse(localStorage.getItem(this.userKey)!);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.userKey);
  }
  
}
