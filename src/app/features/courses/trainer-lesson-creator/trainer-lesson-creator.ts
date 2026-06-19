import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { MediaService } from '../../../core/services/media.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-trainer-lesson-creator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-lesson-creator.html',
  styleUrls: ['./trainer-lesson-creator.css'],
})
export class TrainerLessonCreator implements OnInit {
  private courseService = inject(CourseService);
  private mediaService = inject(MediaService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  courses: any[] = [];
  selectedCourseId: string = '';

  isSubmitting = false;

  // Lessons Data
  lessons: any[] = [];
  lessonForm = {
    title: '',
    description: '',
    durationInMinutes: 0,
    isPreviewFree: false,
  };

  // Upload state
  uploadingLessonId: string | null = null;

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data || res || [];
      },
      error: (err: any) => {
        this.toastr.error('Failed to load courses.');
        console.error(err);
      },
    });
  }

  // Optional: load existing lessons when a course is selected
  onCourseSelected() {
    if (!this.selectedCourseId) return;
    this.lessons = []; // Reset local lessons array

    this.courseService.getCourseById(this.selectedCourseId).subscribe({
      next: (res: any) => {
        const course = res.data || res;
        if (course && course.lessons) {
          // Map to match the expected format for the UI
          this.lessons = course.lessons.map((l: any) => ({
            id: l.id || l.Id,
            title: l.title || l.Title,
            description: l.description || l.Description,
            durationInMinutes: l.durationInMinutes || l.DurationInMinutes,
            hasVideo: !!(l.videoUrl || l.VideoUrl),
          }));
        }
      },
      error: (err: any) => {
        console.error('Failed to load course details', err);
      },
    });
  }

  addLesson() {
    if (!this.selectedCourseId) {
      this.toastr.error('Please select a course first.');
      return;
    }
    if (!this.lessonForm.title || !this.lessonForm.description) {
      this.toastr.warning('Please enter lesson title and description');
      return;
    }

    const payload = {
      courseId: this.selectedCourseId,
      title: this.lessonForm.title,
      description: this.lessonForm.description,
      durationInMinutes: this.lessonForm.durationInMinutes,
      isPreviewFree: this.lessonForm.isPreviewFree,
      videoUrl: '',
      pdfUrl: '',
    };

    this.isSubmitting = true;
    this.courseService.createLesson(payload).subscribe({
      next: (res: any) => {
        const newLessonId = res.data?.id || res.id;
        this.toastr.success('Lesson added! You can now upload a video.');

        // Add to local list to show in UI
        this.lessons.push({
          id: newLessonId,
          title: this.lessonForm.title,
          description: this.lessonForm.description,
          durationInMinutes: this.lessonForm.durationInMinutes,
          hasVideo: false,
        });

        // Reset form
        this.lessonForm = {
          title: '',
          description: '',
          durationInMinutes: 0,
          isPreviewFree: false,
        };
        this.isSubmitting = false;
      },
      error: (err: any) => {
        const errMsg = err.error?.message || err.error?.title || err.message || 'Unknown error';
        this.toastr.error('Failed to add lesson: ' + errMsg);
        this.isSubmitting = false;
        console.error('Add lesson error:', err);
      },
    });
  }

  onFileSelected(event: any, lessonId: string) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        this.uploadVideo(lessonId, file);
      } else {
        this.toastr.warning('Please select a valid video file (mp4, webm, etc.)');
      }
    }
  }

  uploadVideo(lessonId: string, file: File) {
    this.uploadingLessonId = lessonId;

    this.mediaService.uploadMedia(lessonId, file).subscribe({
      next: (res: any) => {
        this.toastr.success('Video uploaded successfully!');
        this.uploadingLessonId = null;

        // Update local state
        const lesson = this.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          lesson.hasVideo = true;
        }
      },
      error: (err: any) => {
        this.toastr.error('Failed to upload video');
        this.uploadingLessonId = null;
        console.error(err);
      },
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  finishLessons() {
    this.toastr.success('Lessons successfully published to the course!');
    this.router.navigate(['/dashboard']);
  }
}
