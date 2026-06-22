import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // ضفنا الـ HttpClient
import { BehaviorSubject, Observable, tap } from 'rxjs'; // ضفنا tap و Observable

@Injectable({
  providedIn: 'root',
})
export class Auth {
  // الرابط الأساسي للباك إيند تبعك (تأكد من رقم البورت عندك)
  private apiUrl = 'http://localhost:5290/api/Auth'; 

  isLoggedIn$ = new BehaviorSubject<boolean>(false);
  isAdmin$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { // حقن الـ HttpClient هنا
    const storedSession = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('isLoggedIn') : null;
    const storedLocal = typeof localStorage !== 'undefined' ? localStorage.getItem('isLoggedIn') : null;
    const storedSessionAdmin = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('isAdmin') : null;
    const storedLocalAdmin = typeof localStorage !== 'undefined' ? localStorage.getItem('isAdmin') : null;

    if (storedSession === 'true' || storedLocal === 'true') {
      this.isLoggedIn$.next(true);
    }
    if (storedSessionAdmin === 'true' || storedLocalAdmin === 'true') {
      this.isAdmin$.next(true);
    }
  }

  // تعديل ميثود الـ login لتستقبل كائن وتتكلم مع السيرفر
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Login`, credentials).pipe(
      tap((response) => {
        // إذا رجع التوكن بنجاح من الباك إيند
        if (response && response.token) {
          // فحص الصلاحية بناءً على الـ role الراجع من الباك إيند أو الإيميل (بحسب رغبتك)
          const userRole = response.role?.toLowerCase() || '';
          const isAdmin = userRole === 'admin' || response.email.toLowerCase().includes('admin');

          // تحديث الـ BehaviorSubjects عشان الفرونت إيند يحس بالتغيير فوراً
          this.isLoggedIn$.next(true);
          this.isAdmin$.next(isAdmin);

          // تخزين البيانات والـ Token في الـ Storage
          try {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            sessionStorage.setItem('token', response.token);
          } catch {}

          try {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.id.toString());
            localStorage.setItem('fullName', response.fullName);
            localStorage.setItem('userEmail', response.email);
          } catch {}
        }
      })
    );
  }
//   register(data: any): Observable<any> {
//   return this.http.post(`${this.apiUrl}/Register`, data);
// }
// أضف هذه الميثود داخل كلاس Auth في ملف auth.ts
register(userData: any): Observable<any> {
  // أضفنا خيار نوع الاستجابة كنص لتجنب خطأ الـ Parsing عندما يرجع الباك إيند نصاً عادياً
  return this.http.post<any>(`${this.apiUrl}/Register`, userData, { responseType: 'text' as 'json' });
}

  logout() {
    this.isLoggedIn$.next(false);
    this.isAdmin$.next(false);
    try {
      sessionStorage.clear(); // تنظيف كامل للـ Session
    } catch {}
    try {
      localStorage.clear(); // تنظيف كامل للـ LocalStorage
    } catch {}
  }
}