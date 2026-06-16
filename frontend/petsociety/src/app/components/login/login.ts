// import { Component, OnInit } from '@angular/core';
// import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { Auth } from '../../services/auth';

// @Component({
//   selector: 'app-login',
//   imports: [ReactiveFormsModule, CommonModule],
//   templateUrl: './login.html',
//   styleUrls: ['./login.css']
// })
// export class Login  {

//   loginForm = new FormGroup({
//   email: new FormControl('', [Validators.required, Validators.email]),
//   Password: new FormControl('', [Validators.required, Validators.minLength(8)])
// });

//   constructor(
//     private auth: Auth,   
//     private router: Router
//   ) {}

//   login() {
//   if (this.loginForm.valid) {
//     console.log('BUTTON CLICKED');

//     // تجهيز البيانات المطابقة للـ DTO في الباك إيند
//     const loginPayload = {
//       email: this.loginForm.value.email,
//       password: this.loginForm.value.Password
//     };

//     // استدعاء ميثود اللوجن الجديدة
//     this.auth.login(loginPayload).subscribe({
//       next: (res) => {
//         console.log('Logged in successfully through API!', res);
//         // التوجيه للهوم بعد نجاح العملية والتخزين التلقائي بالـ Service
//         this.router.navigate(['/Home']);
//       },
//       error: (err) => {
//         console.error('API Login Error:', err);
//         // يمكنك تخزين الخطأ الراجع لعرضه في الـ HTML (مثلاً: err.error)
//         alert(err.error || 'Invalid email or password');
//       }
//     });
//   }
// }

  
// }
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  // loginForm = new FormGroup({
  //   email: new FormControl('', [Validators.required, Validators.email]),
  //   Password: new FormControl('', [Validators.required, Validators.minLength(8)])
  // });
loginForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', [Validators.required])
});
  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  login() {
  if (this.loginForm.invalid) return;

  const loginPayload = {
    email: this.loginForm.get('email')?.value,
    password: this.loginForm.get('password')?.value
  };

  console.log(loginPayload); // 👈 مهم جدًا للتأكد

  this.auth.login(loginPayload).subscribe({
    next: (res) => {
      console.log('Login success', res);
      this.router.navigate(['/Home']);
    },
    error: (err) => {
      console.log('FULL ERROR:', err.error); // 👈 أهم سطر
      alert(err.error);
    }
  });
}
}

