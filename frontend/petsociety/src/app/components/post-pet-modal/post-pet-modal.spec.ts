import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostPetModalComponent } from './post-pet-modal';

describe('PostPetModalComponent', () => {
  let component: PostPetModalComponent;
  let fixture: ComponentFixture<PostPetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostPetModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PostPetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
