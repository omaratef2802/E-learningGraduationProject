import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  badge?: string;
  status?: string;
  description: string;
  subcategories: Subcategory[];
  subcategoriesCount: number;
  courses: number;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/category';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(this.apiUrl);
  }

  getCategoryById(id: string): Observable<{ category: Category }> {
    return this.http.get<{ category: Category }>(`${this.apiUrl}/${id}`);
  }

  getCategoryBySlug(slug: string): Observable<{ category: Category }> {
    return this.http.get<{ category: Category }>(`${this.apiUrl}/catogrybyslugs/${slug}`);
  }
}
