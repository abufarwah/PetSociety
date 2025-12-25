import { Component } from '@angular/core';
import { RouterOutlet, RouterLinkActive, RouterLink, Router } from '@angular/router';
import { Auth } from './services/auth';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  imports: [RouterOutlet , RouterLinkActive, RouterLink , CommonModule],
})
export class App {
  
  constructor(private router: Router, public auth: Auth) { }
}
