import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { WishlistComponent } from './wishlist';
import { WishlistService } from '../../services/wishlist';

describe('Wishlist', () => {
  let component: WishlistComponent;
  let fixture: ComponentFixture<WishlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistComponent],
      providers: [
        provideHttpClient(),
        { provide: WishlistService, useValue: { getWishlist: () => of({ courses: [] }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
