import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  InstructorData,
  AdminCategory
} from '../../page/instructor-data';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';


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

  // =========================================================
  // DATA SERVICE
  // =========================================================

  public readonly data =
    inject(InstructorData);


  // =========================================================
  // CATEGORIES
  // =========================================================

  categories: AdminCategory[] = [];

  filteredCategories: AdminCategory[] = [];


  // =========================================================
  // FILTERS
  // =========================================================

  searchText = '';

  selectedStatus:
    'All'
    | 'Active'
    | 'Inactive' = 'All';


  // =========================================================
  // PAGE STATE
  // =========================================================

  loading = false;

  errorMessage = '';

  successMessage = '';


  // =========================================================
  // MODAL STATE
  // =========================================================

  showCategoryModal = false;

  showDeleteModal = false;

  editingCategoryId: string | null = null;

  categoryToDelete: AdminCategory | null = null;


  // =========================================================
  // FORM
  // =========================================================

  categoryForm = {

    name: '',

    description: '',

    status: 'Active' as
      'Active' | 'Inactive'

  };


  formError = '';

  savingCategory = false;


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadCategories();

  }


  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  loadCategories(): void {

    try {

      this.loading = true;

      this.errorMessage = '';

      this.categories =
        this.data.getAdminCategories();

      this.applyFilters();

      this.loading = false;

    } catch (error) {

      console.error(
        'Admin Categories Error:',
        error
      );

      this.errorMessage =
        'Unable to load categories.';

      this.loading = false;

    }

  }


  // =========================================================
  // FILTERS
  // =========================================================

  applyFilters(): void {

    const search =
      this.searchText
        .toLowerCase()
        .trim();


    this.filteredCategories =
      this.categories.filter(category => {

        const matchesSearch =
          !search ||
          category.name
            .toLowerCase()
            .includes(search) ||
          category.description
            .toLowerCase()
            .includes(search);


        const matchesStatus =
          this.selectedStatus === 'All' ||
          category.status === this.selectedStatus;


        return (
          matchesSearch &&
          matchesStatus
        );

      });

  }


  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = 'All';

    this.applyFilters();

  }


  // =========================================================
  // STATISTICS
  // =========================================================

  getTotalCategories(): number {

    return this.categories.length;

  }


  getActiveCategories(): number {

    return this.categories.filter(
      category =>
        category.status === 'Active'
    ).length;

  }


  getInactiveCategories(): number {

    return this.categories.filter(
      category =>
        category.status === 'Inactive'
    ).length;

  }


  getTotalCourses(): number {

    return this.categories.reduce(
      (total, category) =>
        total +
        Number(category.coursesCount || 0),
      0
    );

  }


  getTotalSubcategories(): number {

    return this.categories.reduce(
      (total, category) =>
        total +
        Number(
          category.subcategoriesCount || 0
        ),
      0
    );

  }


  // =========================================================
  // CATEGORY HELPERS
  // =========================================================

  getCategoryInitial(
    name: string
  ): string {

    return name
      .charAt(0)
      .toUpperCase();

  }


  getCategoryCourseLabel(
    count: number
  ): string {

    return count === 1
      ? 'Course'
      : 'Courses';

  }


  getCategorySubcategoryLabel(
    count: number
  ): string {

    return count === 1
      ? 'Subcategory'
      : 'Subcategories';

  }


  // =========================================================
  // CATEGORY USAGE
  // =========================================================

  getCategoryUsageMessage(
    category: AdminCategory
  ): string {

    const subcategories =
      Number(
        category.subcategoriesCount || 0
      );

    const courses =
      Number(
        category.coursesCount || 0
      );


    if (
      subcategories === 0 &&
      courses === 0
    ) {

      return 'Ready to organize';

    }


    return `
      ${subcategories}
      ${subcategories === 1
        ? 'subcategory'
        : 'subcategories'}
      ·
      ${courses}
      ${courses === 1
        ? 'course'
        : 'courses'}
    `;

  }


  // =========================================================
  // ADD CATEGORY
  // =========================================================

  openAddCategory(): void {

    this.editingCategoryId = null;

    this.categoryForm = {

      name: '',

      description: '',

      status: 'Active'

    };

    this.formError = '';

    this.successMessage = '';

    this.showCategoryModal = true;

  }


  // =========================================================
  // EDIT CATEGORY
  // =========================================================

  openEditCategory(
    category: AdminCategory
  ): void {

    this.editingCategoryId =
      category.id;

    this.categoryForm = {

      name: category.name,

      description: category.description,

      status: category.status

    };

    this.formError = '';

    this.successMessage = '';

    this.showCategoryModal = true;

  }


  // =========================================================
  // CLOSE CATEGORY MODAL
  // =========================================================

  closeCategoryModal(): void {

    if (this.savingCategory) {
      return;
    }

    this.showCategoryModal = false;

    this.editingCategoryId = null;

    this.formError = '';

  }


  // =========================================================
  // SAVE CATEGORY
  // =========================================================

  saveCategory(): void {

    this.formError = '';

    this.successMessage = '';


    const name =
      this.categoryForm.name.trim();


    const description =
      this.categoryForm.description.trim();


    // -------------------------
    // Validation
    // -------------------------

    if (!name) {

      this.formError =
        'Category name is required.';

      return;

    }


    if (name.length < 3) {

      this.formError =
        'Category name must be at least 3 characters.';

      return;

    }


    if (name.length > 80) {

      this.formError =
        'Category name cannot exceed 80 characters.';

      return;

    }


    if (!description) {

      this.formError =
        'Category description is required.';

      return;

    }


    if (description.length < 10) {

      this.formError =
        'Description must be at least 10 characters.';

      return;

    }


    if (description.length > 300) {

      this.formError =
        'Description cannot exceed 300 characters.';

      return;

    }


    // -------------------------
    // Duplicate
    // -------------------------

    const duplicate =
      this.categories.find(
        category =>

          category.id !==
          this.editingCategoryId &&

          category.name
            .trim()
            .toLowerCase() ===
          name.toLowerCase()
      );


    if (duplicate) {

      this.formError =
        'A category with this name already exists.';

      return;

    }


    // -------------------------
    // SAVE
    // -------------------------

    try {

      this.savingCategory = true;


      if (this.editingCategoryId) {

        const updated =
          this.data.updateAdminCategory(
            this.editingCategoryId,
            {
              name,
              description,
              status:
                this.categoryForm.status
            }
          );


        if (!updated) {

          this.formError =
            'Category could not be updated.';

          this.savingCategory = false;

          return;

        }


        this.successMessage =
          'Category updated successfully.';

      } else {

        this.data.addAdminCategory({

          name,

          description,

          subcategoriesCount: 0,

          coursesCount: 0,

          tracksCount: 0,

          status:
            this.categoryForm.status

        });


        this.successMessage =
          'Category added successfully.';

      }


      this.showCategoryModal = false;

      this.editingCategoryId = null;

      this.savingCategory = false;

      this.loadCategories();

      this.clearSuccessMessage();

    } catch (error) {

      console.error(
        'Save Category Error:',
        error
      );

      this.formError =
        'Something went wrong while saving the category.';

      this.savingCategory = false;

    }

  }


  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  toggleCategoryStatus(
    category: AdminCategory
  ): void {

    const newStatus =
      category.status === 'Active'
        ? 'Inactive'
        : 'Active';


    const updated =
      this.data.updateAdminCategory(
        category.id,
        {
          status: newStatus
        }
      );


    if (!updated) {

      this.errorMessage =
        'Unable to update category status.';

      return;

    }


    this.successMessage =
      newStatus === 'Active'

        ? `"${category.name}" is now active.`

        : `"${category.name}" has been deactivated.`;


    this.loadCategories();

    this.clearSuccessMessage();

  }


  // =========================================================
  // DELETE
  // =========================================================

  openDeleteCategory(
    category: AdminCategory
  ): void {

    this.categoryToDelete =
      category;

    this.showDeleteModal = true;

    this.errorMessage = '';

  }


  closeDeleteModal(): void {

    this.showDeleteModal = false;

    this.categoryToDelete = null;

  }


  confirmDeleteCategory(): void {

    if (!this.categoryToDelete) {
      return;
    }


    const category =
      this.categoryToDelete;


    if (
      category.subcategoriesCount > 0 ||
      category.coursesCount > 0
    ) {

      this.closeDeleteModal();

      this.errorMessage =
        `"${category.name}" cannot be deleted because it still contains learning content. Deactivate it instead.`;

      return;

    }


    const deleted =
      this.data.removeAdminCategory(
        category.id
      );


    if (!deleted) {

      this.errorMessage =
        'Category could not be deleted.';

      this.closeDeleteModal();

      return;

    }


    this.successMessage =
      `"${category.name}" was deleted successfully.`;


    this.closeDeleteModal();

    this.loadCategories();

    this.clearSuccessMessage();

  }


  // =========================================================
  // SUCCESS MESSAGE
  // =========================================================

  clearSuccessMessage(): void {

    setTimeout(() => {

      this.successMessage = '';

    }, 3000);

  }

}