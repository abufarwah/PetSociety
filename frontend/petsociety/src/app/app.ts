import { Component } from '@angular/core';
import { RouterOutlet, RouterLinkActive, RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLinkActive, RouterLink],
  templateUrl: './app.html'
})
export class App {

  constructor(private router: Router) { }
}
