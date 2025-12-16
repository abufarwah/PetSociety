import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LostFoundComponent } from './lost-found'; 

describe('LostFoundComponent', () => {
  let component: LostFoundComponent; 
  let fixture: ComponentFixture<LostFoundComponent>; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LostFoundComponent] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(LostFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
