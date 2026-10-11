import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstructorCoursePreview } from './instructor-course-preview';

describe('InstructorCoursePreview', () => {
  let component: InstructorCoursePreview;
  let fixture: ComponentFixture<InstructorCoursePreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorCoursePreview],
    }).compileComponents();

    fixture = TestBed.createComponent(InstructorCoursePreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
