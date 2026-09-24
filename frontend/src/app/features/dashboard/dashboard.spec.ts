import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create the dashboard component', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have mock data for stats, continue learning, courses, and weekly goal', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    expect(component.stats.length).toBe(3);
    expect(component.courses.length).toBe(3);
    expect(component.continueLearning.category).toBe('COMPLETE REACT DEVELOPMENT');
    expect(component.weeklyGoal.days.length).toBe(7);
  });
});
