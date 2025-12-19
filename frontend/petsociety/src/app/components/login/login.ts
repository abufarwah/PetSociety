import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login  {

  loginForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  Password: new FormControl('', [Validators.required, Validators.minLength(8)])
});
  auth: any;

  constructor(private router: Router) {}

  login() {
    if (this.loginForm.valid) {
      this.router.navigate(['/Home']);
    }

    if (this.loginForm.valid) {
    this.auth.login();
    this.router.navigate(['/Account']);
  }
  }

  
}


