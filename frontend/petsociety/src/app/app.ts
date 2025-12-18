import { Component } from '@angular/core';
import { RouterOutlet, RouterLinkActive, RouterLink, Router } from '@angular/router';
import { Auth } from './services/auth';
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  imports: [RouterOutlet , RouterLinkActive, RouterLink ],
})
export class App {
  
  constructor(private router: Router, public auth: Auth) { }
}
