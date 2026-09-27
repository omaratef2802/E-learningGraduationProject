import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { INSTRUCTORS_CONFIG, InstructorItem } from './instructors.config';
import { InstructorData } from '../../page/instructor-data';

@Component({
  selector: 'app-instructors',
  standalone: true,
  templateUrl: './instructors.html',
  styleUrl: './instructors.css',
})
export class Instructors {
  private readonly router = inject(Router);
  protected readonly data = inject(InstructorData);
  protected readonly config = INSTRUCTORS_CONFIG;

  get instructorsList(): InstructorItem[] {
    const tones = ['violet', 'cyan', 'coral', 'gold'];
    const lead = this.data.instructor;
    const items: InstructorItem[] = [];

    if (lead) {
      items.push({
        name: `${lead.firstName} ${lead.lastName}`.trim(),
        role: lead.role || 'Lead Instructor',
        bio: lead.bio || 'Senior software engineer and lead instructor specializing in modern full-stack development.',
        image: lead.image || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=85',
        rating: '4.95',
        learners: '12,400+',
        tone: 'violet'
      });
    }

    // Add other registered teaching accounts from data file
    const otherInstructors = this.data.adminUsers
      ? this.data.adminUsers.filter(u => u.role === 'Instructor' && u.name !== items[0]?.name)
      : [];

    otherInstructors.forEach((inst, idx) => {
      items.push({
        name: inst.name,
        role: 'Senior Instructor',
        bio: 'Industry expert delivering practical, hands-on masterclasses and real-world project guidance.',
        image: this.config.items[idx + 1]?.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=85',
        rating: '4.90',
        learners: '9,800+',
        tone: tones[(items.length) % tones.length]
      });
    });

    // Complete up to 4 items using default config if needed
    for (let i = items.length; i < this.config.items.length; i++) {
      items.push(this.config.items[i]);
    }

    return items;
  }

  viewInstructor(name: string): void {
    this.router.navigate(['/search'], { queryParams: { instructor: name } });
  }
}
