import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideX,
  lucideMail,
  lucidePlay,
  lucideCheckSquare,
  lucideAward
} from '@ng-icons/lucide';
import { StudentItem } from '../../students.model';

@Component({
  selector: 'app-student-drawer',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      lucideX,
      lucideMail,
      lucidePlay,
      lucideCheckSquare,
      lucideAward
    })
  ],
  templateUrl: './student-drawer.html',
  styleUrl: './student-drawer.css'
})
export class StudentDrawerComponent {
  @Input() student: StudentItem | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() sendMessage = new EventEmitter<StudentItem>();

  onClose(): void {
    this.close.emit();
  }

  onSendMessage(): void {
    if (this.student) {
      this.sendMessage.emit(this.student);
    }
  }
}
