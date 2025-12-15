import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';		


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login  {

  loginForm = new FormGroup({
  email: new FormControl('', Validators.required),
  Password: new FormControl('', Validators.required)
});

  constructor(private router: Router) {}

  login() {
    if (this.loginForm.valid) {
      this.router.navigate(['/Home']);
    }
  }
}


