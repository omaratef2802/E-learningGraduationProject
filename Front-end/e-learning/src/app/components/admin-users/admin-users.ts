import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  InstructorData,
  AdminUser
} from '../../page/instructor-data';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';

interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'Student' | 'Instructor' | 'Admin';
  status: 'Active' | 'Pending' | 'Blocked';
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsers implements OnInit {

  public readonly data = inject(InstructorData);

  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];

  searchText = '';

  selectedRole:
    | 'All'
    | 'Student'
    | 'Instructor'
    | 'Admin' = 'All';

  selectedStatus:
    | 'All'
    | 'Active'
    | 'Pending'
    | 'Blocked' = 'All';

  loading = false;
  errorMessage = '';

  modalOpen = false;

  modalMode:
    | 'add-user'
    | 'add-instructor'
    | 'edit' = 'add-user';

  editingUser: AdminUser | null = null;

  form: UserForm = this.createEmptyForm();

  submitted = false;
  successMessage = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    try {
      this.loading = true;
      this.errorMessage = '';

      this.users = this.data.getAdminUsers();
      this.applyFilters();
    } catch (error) {
      console.error('Admin Users Error:', error);
      this.errorMessage = 'Unable to load users.';
    } finally {
      this.loading = false;
    }
  }

  applyFilters(): void {
    const search = this.searchText.toLowerCase().trim();

    this.filteredUsers = this.users.filter(user => {
      const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);

      const matchesRole =
        this.selectedRole === 'All' ||
        user.role === this.selectedRole;

      const matchesStatus =
        this.selectedStatus === 'All' ||
        user.status === this.selectedStatus;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedRole = 'All';
    this.selectedStatus = 'All';

    this.applyFilters();
  }

  openAddUser(): void {
    this.modalMode = 'add-user';
    this.editingUser = null;

    this.form = this.createEmptyForm();
    this.form.role = 'Student';
    this.form.status = 'Active';

    this.submitted = false;
    this.modalOpen = true;
  }

  openAddInstructor(): void {
    this.modalMode = 'add-instructor';
    this.editingUser = null;

    this.form = this.createEmptyForm();
    this.form.role = 'Instructor';
    this.form.status = 'Pending';

    this.submitted = false;
    this.modalOpen = true;
  }

  openEditUser(user: AdminUser): void {
    const parts = user.name
      .trim()
      .split(' ')
      .filter(Boolean);

    this.modalMode = 'edit';
    this.editingUser = user;

    this.form = {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      status: user.status
    };

    this.submitted = false;
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingUser = null;
    this.submitted = false;
    this.form = this.createEmptyForm();
  }

  createEmptyForm(): UserForm {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Student',
      status: 'Active'
    };
  }

  get isEditMode(): boolean {
    return this.modalMode === 'edit';
  }

  get isInstructorMode(): boolean {
    return this.modalMode === 'add-instructor';
  }

  get modalTitle(): string {
    switch (this.modalMode) {
      case 'add-instructor':
        return 'Add Instructor';

      case 'edit':
        return 'Edit User';

      default:
        return 'Add User';
    }
  }

  get submitLabel(): string {
    switch (this.modalMode) {
      case 'add-instructor':
        return 'Create Instructor';

      case 'edit':
        return 'Save Changes';

      default:
        return 'Create User';
    }
  }

  isNameValid(value: string): boolean {
    const name = value.trim();

    return (
      name.length >= 2 &&
      name.length <= 30 &&
      /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(name)
    );
  }

  isEmailValid(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
      value.trim()
    );
  }

  isPasswordValid(value: string): boolean {
    return value.length >= 8;
  }

  get firstNameError(): string {
    if (!this.submitted && !this.form.firstName) {
      return '';
    }

    if (!this.form.firstName.trim()) {
      return 'First name is required.';
    }

    if (!this.isNameValid(this.form.firstName)) {
      return 'Use 2–30 letters only.';
    }

    return '';
  }

  get lastNameError(): string {
    if (!this.submitted && !this.form.lastName) {
      return '';
    }

    if (!this.form.lastName.trim()) {
      return 'Last name is required.';
    }

    if (!this.isNameValid(this.form.lastName)) {
      return 'Use 2–30 letters only.';
    }

    return '';
  }

  get emailError(): string {
    if (!this.submitted && !this.form.email) {
      return '';
    }

    if (!this.form.email.trim()) {
      return 'Email is required.';
    }

    if (!this.isEmailValid(this.form.email)) {
      return 'Enter a valid email address.';
    }

    if (this.emailExists()) {
      return 'This email is already registered.';
    }

    return '';
  }

  get passwordError(): string {
    if (
      this.isEditMode &&
      !this.form.password
    ) {
      return '';
    }

    if (!this.form.password) {
      return 'Password is required.';
    }

    if (!this.isPasswordValid(this.form.password)) {
      return 'Password must be at least 8 characters.';
    }

    return '';
  }

  get confirmPasswordError(): string {
    if (
      this.isEditMode &&
      !this.form.password &&
      !this.form.confirmPassword
    ) {
      return '';
    }

    if (!this.form.confirmPassword) {
      return 'Please confirm the password.';
    }

    if (
      this.form.password !==
      this.form.confirmPassword
    ) {
      return 'Passwords do not match.';
    }

    return '';
  }

  get isFormValid(): boolean {
    const namesValid =
      this.isNameValid(this.form.firstName) &&
      this.isNameValid(this.form.lastName);

    const emailValid =
      this.isEmailValid(this.form.email);

    if (
      !namesValid ||
      !emailValid ||
      this.emailExists()
    ) {
      return false;
    }

    if (
      this.isEditMode &&
      !this.form.password
    ) {
      return true;
    }

    return (
      this.isPasswordValid(this.form.password) &&
      this.form.password ===
        this.form.confirmPassword
    );
  }

  private emailExists(): boolean {
    const email =
      this.form.email.trim().toLowerCase();

    return this.users.some(
      user =>
        user.email.toLowerCase() === email &&
        user.id !== this.editingUser?.id
    );
  }

  submitForm(): void {
    this.submitted = true;

    if (!this.isFormValid) {
      return;
    }

    const name =
      `${this.form.firstName.trim()} ${this.form.lastName.trim()}`;

    const mode = this.modalMode;

    if (mode === 'edit') {
      if (!this.editingUser) {
        return;
      }

      this.data.updateAdminUser(
        this.editingUser.id,
        {
          name,
          email: this.form.email.trim(),
          role: this.form.role,
          status: this.form.status
        }
      );

      this.showSuccess(
        'User updated successfully.'
      );
    } else {
      this.data.addAdminUser({
        name,
        email: this.form.email.trim(),
        role:
          mode === 'add-instructor'
            ? 'Instructor'
            : this.form.role,
        status:
          mode === 'add-instructor'
            ? 'Pending'
            : this.form.status
      });

      this.showSuccess(
        mode === 'add-instructor'
          ? 'Instructor created successfully.'
          : 'User created successfully.'
      );
    }

    this.loadUsers();
    this.closeModal();
  }

  changeStatus(
    user: AdminUser,
    status: AdminUser['status']
  ): void {
    this.data.updateAdminUserStatus(
      user.id,
      status
    );

    this.loadUsers();

    this.showSuccess(
      `${user.name}'s status changed to ${status}.`
    );
  }

  deleteUser(user: AdminUser): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    this.data.removeAdminUser(user.id);

    this.loadUsers();

    this.showSuccess(
      'User deleted successfully.'
    );
  }

  showSuccess(message: string): void {
    this.successMessage = message;

    window.setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  getUserInitials(name: string): string {
    const parts = name
      .trim()
      .split(' ')
      .filter(Boolean);

    if (!parts.length) {
      return 'U';
    }

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  getTotalUsers(): number {
    return this.filteredUsers.length;
  }

  getStudentCount(): number {
    return this.filteredUsers.filter(
      user => user.role === 'Student'
    ).length;
  }

  getInstructorCount(): number {
    return this.filteredUsers.filter(
      user => user.role === 'Instructor'
    ).length;
  }

  getAdminCount(): number {
    return this.filteredUsers.filter(
      user => user.role === 'Admin'
    ).length;
  }
}