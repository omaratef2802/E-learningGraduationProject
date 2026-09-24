import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeeklyGoal, WeeklyRhythmDay } from '../../dashboard.model';

@Component({
  selector: 'app-weekly-learning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weekly-learning.html',
  styleUrl: './weekly-learning.css'
})
export class WeeklyLearningComponent {
  @Input({ required: true }) weeklyGoal!: WeeklyGoal;

  getDayTextClass(day: WeeklyRhythmDay): string {
    if (day.status === 'highlight') return 'text-indigo-600 font-bold';
    if (day.status === 'current') return 'text-purple-600 font-bold';
    if (day.status === 'empty') return 'text-slate-300 font-medium';
    return 'text-slate-500 font-medium';
  }

  getDayLabelClass(day: WeeklyRhythmDay): string {
    if (day.status === 'highlight') return 'text-slate-900 font-bold';
    if (day.status === 'current') return 'text-purple-600 font-bold';
    if (day.status === 'empty') return 'text-slate-400 font-medium';
    return 'text-slate-500 font-medium';
  }

  getBarHeight(hours: number): number {
    return Math.max(28, Math.round(hours * 32));
  }
}
