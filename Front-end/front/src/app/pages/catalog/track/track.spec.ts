import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Track } from './track';
describe('Track', () => {
  let component: Track;
  let fixture: ComponentFixture<Track>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Track],
    }).compileComponents();
    fixture = TestBed.createComponent(Track);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
