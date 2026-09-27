import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCategories } from './admin-categories';

describe('AdminCategories', () => {
  let component: AdminCategories;
  let fixture: ComponentFixture<AdminCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
