// import { Component } from '@angular/core';
// import { FormControl, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { validate } from '@angular/forms/signals';

// @Component({
//   selector: 'app-signup',
//   imports: [ReactiveFormsModule, CommonModule],
//   templateUrl: './signup.html',
//   styleUrl: './signup.css',
// })
// export class Signup {
//  // Validator to ensure Password1 and password2 match so the user knows they typed correctly to sign up
//  passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
//    const pass = group.get('Password1')?.value;
//    const confirm = group.get('password2')?.value;
//    if (!pass || !confirm) return null;
//    return pass === confirm ? null : { passwordMismatch: true };
//  };

//  signupnForm = new FormGroup(
//    {
//      name: new FormControl('', [Validators.required]),
//      phone: new FormControl('', [Validators.required, Validators.pattern(/^\+962[0-9]{9}$/)]),
//      email: new FormControl('', [Validators.required, Validators.email]),
//      Password1: new FormControl('', [Validators.required, Validators.minLength(8)]),
//      password2: new FormControl('', [Validators.required, Validators.minLength(8)])
//    },
//    { validators: this.passwordsMatchValidator }
//  );
//   constructor(private router: Router) {}

// signup() {
// if (this.signupnForm.valid) {
//       this.router.navigate(['/login']);
//     }
// }


// }
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth'; // 👈 تأكد من صحة مسار ملف الـ Auth عندك

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  
  // الـ Validator الخاص بك بعد تعديل مسميات الحقول لتطابق الباك إيند
  passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!pass || !confirm) return null;
    return pass === confirm ? null : { passwordMismatch: true };
  };

  // تعديل مسميات الحقول لتطابق الـ DTO في الـ .NET تماماً (حروف سمول)
  signupnForm = new FormGroup(
    {
      fullName: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^\+962[0-9]{9}$/)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)])
    },
    { validators: this.passwordsMatchValidator }
  );

  // حقن الـ Auth service هنا بجانب الـ Router
  constructor(
    private auth: Auth, 
    private router: Router
  ) {}

  signup() {
  if (this.signupnForm.valid) {
    console.log('Sending Registration Data:', this.signupnForm.value);

    this.auth.register(this.signupnForm.value).subscribe({
      next: (res: any) => {
        console.log('Signup Successful!', res);
        // ستظهر هنا جملة النجاح القادمة من السيرفر مباشرة
        alert(res || 'Account created successfully!'); 
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Signup API Error:', err);
        // قراءة رسالة الخطأ سواء كانت نصية أو كائن
        const errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Registration failed.');
        alert(errorMsg);
      }
    });
  }
}
}