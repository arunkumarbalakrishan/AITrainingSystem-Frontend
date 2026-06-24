import { Component, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-learning-statistics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row g-4 mb-4">
      
      <!-- LMS Quick Stats Grid -->
      @for (stat of getLmsStats(); track stat.label) {
        <div class="col-6 col-md-3 col-lg-2-4">
          <div class="stat-card p-3.5 h-100 d-flex flex-column justify-content-between">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-secondary small fw-bold text-uppercase" style="letter-spacing: 0.5px;">{{ stat.label }}</span>
              <div class="icon-wrapper d-flex align-items-center justify-content-center" [style.background-color]="stat.color + '15'" [style.color]="stat.color">
                <i [class]="'bi ' + stat.icon"></i>
              </div>
            </div>
            <div>
              <h3 class="fw-bold text-white mb-0 value-glowing">{{ stat.displayVal }}</h3>
              <small class="text-secondary opacity-60">{{ stat.subtext }}</small>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .stat-card {
      background: rgba(13, 17, 23, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .stat-card:hover {
      transform: translateY(-4px);
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    }
    .icon-wrapper {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 1.1rem;
    }
    .value-glowing {
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.15);
      font-size: 1.8rem;
      letter-spacing: -0.5px;
    }
    .col-lg-2-4 {
      flex: 0 0 20%;
      max-width: 20%;
    }
    @media (max-width: 991.98px) {
      .col-lg-2-4 {
        flex: 0 0 33.33%;
        max-width: 33.33%;
      }
    }
    @media (max-width: 575.98px) {
      .col-lg-2-4 {
        flex: 0 0 50%;
        max-width: 50%;
      }
    }
  `]
})
export class LearningStatisticsComponent implements OnInit, OnChanges {
  @Input() stats: any = {};
  @Input() role: string = 'Student';

  // State to hold animated numbers if needed, or simple dynamic rendering
  lmsStatsList = signal<any[]>([]);

  ngOnInit() {
    this.refreshStats();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['stats'] || changes['role']) {
      this.refreshStats();
    }
  }

  refreshStats() {
    this.lmsStatsList.set(this.getLmsStats());
  }

  getLmsStats(): any[] {
    if (this.role === 'Trainer') {
      return [
        { label: 'Courses Created', displayVal: String(this.stats.coursesCreated || 2), subtext: 'Total lectures', icon: 'bi-journal-plus', color: '#60a5fa' },
        { label: 'Total Students', displayVal: String(this.stats.studentsEnrolled || 1280), subtext: 'Active learners', icon: 'bi-people-fill', color: '#9FEF00' },
        { label: 'Issued Certs', displayVal: String(this.stats.certificatesIssued || 485), subtext: 'Credentials', icon: 'bi-award-fill', color: '#FFB800' },
        { label: 'Average Rating', displayVal: String(this.stats.averageRating || 4.85), subtext: '48 feedback reviews', icon: 'bi-star-fill', color: '#00D26A' },
        { label: 'Delivered Hours', displayVal: String(this.stats.hoursDelivered || 230) + 'h', subtext: 'Broadcasting', icon: 'bi-play-btn-fill', color: '#e879f9' }
      ];
    } else {
      return [
        { label: 'Enrolled Courses', displayVal: String(this.stats.coursesEnrolled || 6), subtext: 'Ongoing studies', icon: 'bi-journal-bookmark-fill', color: '#60a5fa' },
        { label: 'Completed', displayVal: String(this.stats.coursesCompleted || 3), subtext: 'Finalized courses', icon: 'bi-journal-check', color: '#00D26A' },
        { label: 'Certificates', displayVal: String(this.stats.certificatesEarned || 3), subtext: 'LMS credentials', icon: 'bi-award-fill', color: '#FFB800' },
        { label: 'Study Hours', displayVal: String(this.stats.learningHours || 54) + 'h', subtext: 'Total logs', icon: 'bi-clock-fill', color: '#9FEF00' },
        { label: 'Daily Streak', displayVal: String(this.stats.currentStreak || 12) + 'd', subtext: 'Consecutive days', icon: 'bi-lightning-charge-fill', color: '#e879f9' }
      ];
    }
  }
}
