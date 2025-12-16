import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core'; // 1. أضفنا ChangeDetectorRef
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lost-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lost-found.html',
  styleUrls: ['./lost-found.css']
})
export class LostFoundComponent implements OnInit {

  lostImageName: string | null = null;
  foundImageName: string | null = null;

  // متغيرات العدادات
  lostCount: number = 0;
  foundCount: number = 0;
  reunitedCount: number = 0;

  @ViewChild('lostInput') lostInputVariable!: ElementRef;
  @ViewChild('foundInput') foundInputVariable!: ElementRef;

  // 2. يجب إضافة constructor لاستخدام كاشف التغييرات
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // تشغيل العدادات
    this.startCounter('lostCount', 120);
    this.startCounter('foundCount', 85);
    this.startCounter('reunitedCount', 50);
  }

  startCounter(prop: 'lostCount' | 'foundCount' | 'reunitedCount', target: number) {
    let current = 0;
    const duration = 2000; // المدة بالمللي ثانية (ثانيتين)
    const steps = 50; // عدد الخطوات
    const increment = target / steps; // مقدار الزيادة
    const stepTime = duration / steps; // الوقت بين كل خطوة

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        this[prop] = target;
        clearInterval(timer);
      } else {
        this[prop] = Math.floor(current);
      }
      
      // 3. هذا هو السطر السحري: "يا أنجولار، حدث الشاشة الآن!"
      this.cdr.detectChanges(); 

    }, stepTime);
  }

  // دوال الصور (كما هي)
  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      if (type === 'lost') this.lostImageName = file.name;
      else this.foundImageName = file.name;
    }
  }

  clearImages() {
    this.lostImageName = null;
    this.foundImageName = null;
    if (this.lostInputVariable) this.lostInputVariable.nativeElement.value = '';
    if (this.foundInputVariable) this.foundInputVariable.nativeElement.value = '';
  }
}