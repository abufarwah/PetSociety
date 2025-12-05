import { Component } from '@angular/core';
import { RouterOutlet, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLinkActive],
  templateUrl: './app.html'
})
export class App {}
