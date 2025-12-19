import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { validate } from '@angular/forms/signals';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
 signupnForm = new FormGroup({
  name: new FormControl('', [Validators.required]),
  phone: new FormControl('', [Validators.required, Validators.pattern(/^\+962[0-9]{9}$/)]),
  email: new FormControl('', [Validators.required, Validators.email]),
  Password1: new FormControl('', [Validators.required, Validators.minLength(8)]),
  password2: new FormControl('', [Validators.required, Validators.minLength(8)])
});
  constructor(private router: Router) {}

signup() {
if (this.signupnForm.valid) {
      this.router.navigate(['/login']);
    }
}


}
