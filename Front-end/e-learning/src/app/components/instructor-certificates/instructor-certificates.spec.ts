import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

import { InstructorCertificatesComponent } from './instructor-certificates';
import { InstructorDataService } from '../../services/instructor-data.service';

describe('InstructorCertificates', () => {
  let component: InstructorCertificatesComponent;
  let fixture: ComponentFixture<InstructorCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorCertificatesComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: InstructorDataService, useValue: { getProfile: () => of(null), getCertificates: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InstructorCertificatesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
