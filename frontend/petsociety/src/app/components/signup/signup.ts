import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';		

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
 signupnForm = new FormGroup({
  email: new FormControl('', Validators.required),
  password: new FormControl('', Validators.required)
});
  constructor(private router: Router) {}

signup() {
if (this.signupnForm.valid) {
      this.router.navigate(['/login']);
    }
}


}
