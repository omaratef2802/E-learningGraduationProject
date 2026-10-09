import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { TrackPage } from './track';

describe('TrackPage', () => {
  let component: TrackPage;
  let fixture: ComponentFixture<TrackPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackPage],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        // The page reads the id from the URL; no id means the empty state.
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map() } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
