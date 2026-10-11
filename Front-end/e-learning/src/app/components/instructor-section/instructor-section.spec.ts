import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstructorSection } from './instructor-section';

describe('InstructorSection', () => {
  let component: InstructorSection;
  let fixture: ComponentFixture<InstructorSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorSection],
    }).compileComponents();

    fixture = TestBed.createComponent(InstructorSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
