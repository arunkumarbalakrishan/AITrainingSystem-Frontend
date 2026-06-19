import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { MediaService } from '../../../core/services/media.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-trainer-course-creator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trainer-course-creator.component.html',
  styleUrls: ['./trainer-course-creator.component.css'],
})
export class TrainerCourseCreatorComponent implements OnInit {
  private courseService = inject(CourseService);
  private mediaService = inject(MediaService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  // Wizard State
  currentStep = 1; // 1: Course Info, 2: Publish
  isSubmitting = false;

  // Course Data
  createdCourseId: string | null = null;
  courseForm = {
    title: '',
    description: '',
    price: 0,
    durationInHours: 0,
    thumbnailUrl: '',
  };

  ngOnInit() {}

  // --- STEP 1: CREATE COURSE ---
  createCourse() {
    if (!this.courseForm.title || !this.courseForm.description) {
      this.toastr.warning('Please fill in the required course details');
      return;
    }

    this.isSubmitting = true;
    this.courseService.createCourse(this.courseForm).subscribe({
      next: (res: any) => {
        // Backend returns Ok(new { Success, Message, Data = { Id } })
        this.createdCourseId =
          res.data?.id || res.data?.Id || res.Data?.id || res.Data?.Id || res.id || res.Id;

        if (!this.createdCourseId) {
          this.toastr.error('Course created but no ID was returned from the server.');
          console.error('Course creation response missing ID:', res);
        } else {
          this.toastr.success('Course created successfully!');
          this.currentStep = 2; // Move to Lessons step
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastr.error('Failed to create course');
        this.isSubmitting = false;
        console.error(err);
      },
    });
  }

  // --- STEP 2: PUBLISH / FINISH ---
  finishCourse() {
    this.toastr.success('Course authoring completed!');
    this.router.navigate(['/dashboard']);
  }
}
