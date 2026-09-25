import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstructorCertificates } from './instructor-certificates';

describe('InstructorCertificates', () => {
  let component: InstructorCertificates;
  let fixture: ComponentFixture<InstructorCertificates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorCertificates],
    }).compileComponents();

    fixture = TestBed.createComponent(InstructorCertificates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
