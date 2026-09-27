import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../../services/admin.service';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';

export interface AdminCategory {
  id: string;
  name: string;
  description: string;
  subcategoriesCount: number;
  coursesCount: number;
  tracksCount: number;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css',
})
export class AdminCategories implements OnInit {

  private adminService = inject(AdminService);

  categories: AdminCategory[] = [];
  filteredCategories: AdminCategory[] = [];

  searchText = '';
  selectedStatus: 'All' | 'Active' | 'Inactive' = 'All';

  loading = false;
  errorMessage = '';
  successMessage = '';

  showCategoryModal = false;
  showDeleteModal = false;
  editingCategoryId: string | null = null;
  categoryToDelete: AdminCategory | null = null;

  categoryForm = {
    name: '',
    description: '',
    status: 'Active' as 'Active' | 'Inactive'
  };

  formError = '';
  savingCategory = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    this.adminService.getCategories().subscribe({
      next: (res: any) => {
        const cats = res.data || res || [];
        this.categories = cats.map((c: any) => ({
           id: c._id || c.id,
           name: c.name,
           description: c.description || '',
           subcategoriesCount: c.subCategories?.length || c.subcategoriesCount || 0,
           coursesCount: c.courses?.length || c.coursesCount || 0,
           tracksCount: c.tracksCount || 0,
           status: c.status || 'Active'
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Admin Categories Error:', err);
        this.errorMessage = 'Unable to load categories.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const search = this.searchText.toLowerCase().trim();
    this.filteredCategories = this.categories.filter(category => {
      const matchesSearch = !search ||
        category.name.toLowerCase().includes(search) ||
        category.description.toLowerCase().includes(search);
      const matchesStatus = this.selectedStatus === 'All' || category.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = 'All';
    this.applyFilters();
  }

  getTotalCategories(): number {
    return this.categories.length;
  }

  getActiveCategories(): number {
    return this.categories.filter(c => c.status === 'Active').length;
  }

  getInactiveCategories(): number {
    return this.categories.filter(c => c.status === 'Inactive').length;
  }

  getTotalCourses(): number {
    return this.categories.reduce((total, c) => total + Number(c.coursesCount || 0), 0);
  }

  getTotalSubcategories(): number {
    return this.categories.reduce((total, c) => total + Number(c.subcategoriesCount || 0), 0);
  }

  getCategoryInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : 'C';
  }

  getCategoryCourseLabel(count: number): string {
    return count === 1 ? 'Course' : 'Courses';
  }

  getCategorySubcategoryLabel(count: number): string {
    return count === 1 ? 'Subcategory' : 'Subcategories';
  }

  getCategoryUsageMessage(category: AdminCategory): string {
    const subcategories = Number(category.subcategoriesCount || 0);
    const courses = Number(category.coursesCount || 0);
    if (subcategories === 0 && courses === 0) {
      return 'Ready to organize';
    }
    return `${subcategories} ${subcategories === 1 ? 'subcategory' : 'subcategories'} · ${courses} ${courses === 1 ? 'course' : 'courses'}`;
  }

  openAddCategory(): void {
    this.editingCategoryId = null;
    this.categoryForm = { name: '', description: '', status: 'Active' };
    this.formError = '';
    this.successMessage = '';
    this.showCategoryModal = true;
  }

  openEditCategory(category: AdminCategory): void {
    this.editingCategoryId = category.id;
    this.categoryForm = {
      name: category.name,
      description: category.description,
      status: category.status
    };
    this.formError = '';
    this.successMessage = '';
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    if (this.savingCategory) return;
    this.showCategoryModal = false;
    this.editingCategoryId = null;
    this.formError = '';
  }

  saveCategory(): void {
    this.formError = '';
    this.successMessage = '';

    const name = this.categoryForm.name.trim();
    const description = this.categoryForm.description.trim();

    if (!name || name.length < 3 || name.length > 80) {
      this.formError = 'Category name must be between 3 and 80 characters.';
      return;
    }
    if (!description || description.length < 10 || description.length > 300) {
      this.formError = 'Description must be between 10 and 300 characters.';
      return;
    }

    const duplicate = this.categories.find(c => c.id !== this.editingCategoryId && c.name.trim().toLowerCase() === name.toLowerCase());
    if (duplicate) {
      this.formError = 'A category with this name already exists.';
      return;
    }

    this.savingCategory = true;
    const payload = { name, description, status: this.categoryForm.status };

    if (this.editingCategoryId) {
      this.adminService.updateCategory(this.editingCategoryId, payload).subscribe({
         next: () => {
            this.successMessage = 'Category updated successfully.';
            this.showCategoryModal = false;
            this.savingCategory = false;
            this.loadCategories();
            this.clearSuccessMessage();
         },
         error: (err) => {
            console.error(err);
            this.formError = 'Category could not be updated.';
            this.savingCategory = false;
         }
      });
    } else {
      this.adminService.createCategory(payload).subscribe({
         next: () => {
            this.successMessage = 'Category added successfully.';
            this.showCategoryModal = false;
            this.savingCategory = false;
            this.loadCategories();
            this.clearSuccessMessage();
         },
         error: (err) => {
            console.error(err);
            this.formError = 'Something went wrong while saving the category.';
            this.savingCategory = false;
         }
      });
    }
  }

  toggleCategoryStatus(category: AdminCategory): void {
    const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';
    this.adminService.updateCategory(category.id, { status: newStatus }).subscribe({
       next: () => {
         this.successMessage = newStatus === 'Active' ? `"${category.name}" is now active.` : `"${category.name}" has been deactivated.`;
         this.loadCategories();
         this.clearSuccessMessage();
       },
       error: (err) => {
         console.error(err);
         this.errorMessage = 'Unable to update category status.';
       }
    });
  }

  openDeleteCategory(category: AdminCategory): void {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
    this.errorMessage = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.categoryToDelete = null;
  }

  confirmDeleteCategory(): void {
    if (!this.categoryToDelete) return;
    const category = this.categoryToDelete;

    if (category.subcategoriesCount > 0 || category.coursesCount > 0) {
      this.closeDeleteModal();
      this.errorMessage = `"${category.name}" cannot be deleted because it still contains learning content. Deactivate it instead.`;
      return;
    }

    this.adminService.deleteCategory(category.id).subscribe({
       next: () => {
         this.successMessage = `"${category.name}" was deleted successfully.`;
         this.closeDeleteModal();
         this.loadCategories();
         this.clearSuccessMessage();
       },
       error: (err) => {
         console.error(err);
         this.errorMessage = 'Category could not be deleted.';
         this.closeDeleteModal();
       }
    });
  }

  clearSuccessMessage(): void {
    setTimeout(() => { this.successMessage = ''; }, 3000);
  }
}