import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetSocietyPlus } from './pet-society-plus';

describe('PetSocietyPlus', () => {
  let component: PetSocietyPlus;
  let fixture: ComponentFixture<PetSocietyPlus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetSocietyPlus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetSocietyPlus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
