import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCreateCourse } from './admin-create-course';

describe('AdminCreateCourse', () => {
  let component: AdminCreateCourse;
  let fixture: ComponentFixture<AdminCreateCourse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCreateCourse],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCreateCourse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
