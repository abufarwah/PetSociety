import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-account',
  imports: [RouterModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account {
constructor(
    private auth: Auth,
    private router: Router
  ) {}

  logout(event: Event) {
  event.preventDefault();
  event.stopPropagation();

  this.auth.logout();
  this.router.navigate(['/Home']);
}

}
