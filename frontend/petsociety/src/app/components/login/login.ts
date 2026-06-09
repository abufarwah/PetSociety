import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

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

  constructor(
    private auth: Auth,   
    private router: Router
  ) {}

  login() {
    if (!this.loginForm.valid) {
      return;
    }

    const email = this.loginForm.value.email || '';
    console.log('BUTTON CLICKED');
    this.auth.login(email);

    try {
      localStorage.setItem('isLoggedIn', 'true');
    } catch {}

    try {
      localStorage.setItem('userEmail', email);
    } catch {}

    this.router.navigate(['/Home']);
  }

  
}


