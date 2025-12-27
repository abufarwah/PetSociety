import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Adoption } from './adoption';

describe('Adoption', () => {
  let component: Adoption;
  let fixture: ComponentFixture<Adoption>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Adoption, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Adoption);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
