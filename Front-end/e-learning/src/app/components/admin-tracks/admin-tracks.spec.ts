import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTracks } from './admin-tracks';

describe('AdminTracks', () => {
  let component: AdminTracks;
  let fixture: ComponentFixture<AdminTracks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTracks],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTracks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
