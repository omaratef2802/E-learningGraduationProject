import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { Disciplines } from './disciplines/disciplines';
import { Courses } from './courses/courses';
import { FrontEndTracks } from '../page/catalog/front-end-tracks/front-end-tracks';
import { InstructorService } from '../services/instructor.service';
import { WishlistService } from '../services/wishlist';
import { CartService } from '../services/cart';
import { Category, Course, Track } from '../mock-types';

// Responses arrive after the initial render, just like a real HTTP request.
// Do not call detectChanges after delivering them: the component must notify
// Angular's zoneless scheduler itself.
describe('Catalog asynchronous rendering', () => {
  const category: Category = {
    _id: 'category-1', name: 'Development', slug: 'development',
    description: 'Learn practical development skills.', subcategories: [],
  };
  const course: Course = {
    _id: 'course-1', title: 'Learn Angular', slug: 'learn-angular',
    description: 'Build applications with Angular.', instructorId: 'instructor-1',
    category: 'category-1', track: 'track-1', price: 49, duration: 10,
    level: 'beginner', rating: 0, status: 'published', objectives: [], prerequisites: [],
  };
  const track: Track = {
    _id: 'track-1', title: 'Front-End Development', slug: 'front-end-development',
    description: 'Learn modern front-end development.', categoryId: 'category-1',
    requiredSkills: [], relatedCourses: [],
  };

  it('renders discipline cards when categories arrive after initial rendering', async () => {
    const response = new Subject<Category[]>();
    TestBed.configureTestingModule({
      imports: [Disciplines],
      providers: [provideRouter([]), {
        provide: InstructorService, useValue: { getCategories: () => response },
      }],
    });
    const fixture = TestBed.createComponent(Disciplines);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.discipline-card').length).toBe(0);
    response.next([category]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.discipline-card').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Development');
  });

  it('renders course cards when courses arrive after initial rendering', async () => {
    localStorage.removeItem('token');
    const response = new Subject<Course[]>();
    TestBed.configureTestingModule({
      imports: [Courses],
      providers: [provideRouter([]), {
        provide: InstructorService, useValue: { getAllCourses: () => response },
      }, { provide: WishlistService, useValue: {} }, { provide: CartService, useValue: {} }],
    });
    const fixture = TestBed.createComponent(Courses);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.course-card').length).toBe(0);
    response.next([course]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.course-card').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Learn Angular');
  });

  it('renders track cards when tracks arrive after initial rendering', async () => {
    const categories = new Subject<Category[]>();
    const tracks = new Subject<Track[]>();
    const courses = new Subject<Course[]>();
    TestBed.configureTestingModule({
      imports: [FrontEndTracks],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['categoryId', 'category-1']]) } },
        },
        {
          provide: InstructorService,
          useValue: {
            getCategories: () => categories,
            getTracksByCategory: () => tracks,
            getCoursesByCategory: () => courses,
          },
        },
        { provide: WishlistService, useValue: {} },
        { provide: CartService, useValue: {} },
      ],
    });
    const fixture = TestBed.createComponent(FrontEndTracks);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.track-card').length).toBe(0);

    categories.next([category]);
    await fixture.whenStable();
    tracks.next([track]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.track-card').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Front-End Development');
  });
});
