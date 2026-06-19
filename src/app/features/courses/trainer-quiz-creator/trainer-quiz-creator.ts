import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AIService } from '../../../core/services/ai.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-trainer-quiz-creator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-quiz-creator.html',
  styleUrls: ['./trainer-quiz-creator.css'],
})
export class TrainerQuizCreator implements OnInit {
  private courseService = inject(CourseService);
  private quizService = inject(QuizService);
  private aiService = inject(AIService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  courses: any[] = [];
  selectedCourseId: string = '';
  editingQuestionIndex: number | null = null;

  isSubmitting = false;
  isGeneratingQuiz = false;

  // Quiz Data
  quizForm = {
    title: '',
    description: '',
    passingScore: 70,
    isFinal: false,
  };

  questions: any[] = [];
  questionForm = {
    text: '',
    points: 10,
    questionType: 'SingleChoice',
  };

  currentOptions: any[] = [];
  optionForm = {
    optionText: '',
    isCorrect: false,
  };

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        // Assume res.data or res is an array of courses
        this.courses = res.data || res || [];
      },
      error: (err: any) => {
        this.toastr.error('Failed to load courses.');
        console.error(err);
      },
    });
  }

  addOption() {
    if (!this.optionForm.optionText.trim()) {
      this.toastr.warning('Please enter option text.');
      return;
    }

    // Auto-uncheck others if this is correct and it's a SingleChoice
    if (this.questionForm.questionType === 'SingleChoice' && this.optionForm.isCorrect) {
      this.currentOptions.forEach((opt) => (opt.isCorrect = false));
    }

    this.currentOptions.push({ ...this.optionForm });
    this.optionForm = { optionText: '', isCorrect: false };
  }

  removeOption(index: number) {
    this.currentOptions.splice(index, 1);
  }

  addQuestion() {
    if (!this.questionForm.text.trim()) {
      this.toastr.warning('Please enter the question text.');
      return;
    }
    if (this.currentOptions.length < 2) {
      this.toastr.warning('A question must have at least 2 options.');
      return;
    }
    if (!this.currentOptions.some((opt) => opt.isCorrect)) {
      this.toastr.warning('Please mark at least one option as correct.');
      return;
    }

    if (this.editingQuestionIndex !== null) {
      this.questions[this.editingQuestionIndex] = {
        ...this.questionForm,
        options: [...this.currentOptions],
      };
      this.editingQuestionIndex = null;
      this.toastr.success('Question updated in draft!');
    } else {
      this.questions.push({
        ...this.questionForm,
        options: [...this.currentOptions],
      });
      this.toastr.success('Question added to draft!');
    }

    // Reset question and options
    this.questionForm = { text: '', points: 10, questionType: 'SingleChoice' };
    this.currentOptions = [];
  }

  editQuestion(index: number) {
    this.editingQuestionIndex = index;
    const q = this.questions[index];
    this.questionForm = {
      text: q.text,
      points: q.points || 10,
      questionType: q.questionType || 'SingleChoice',
    };
    this.currentOptions = q.options.map((o: any) => ({
      optionText: o.optionText,
      isCorrect: o.isCorrect,
    }));
    this.toastr.info('Editing question. Scroll up to update.');
  }

  cancelEditQuestion() {
    this.editingQuestionIndex = null;
    this.questionForm = { text: '', points: 10, questionType: 'SingleChoice' };
    this.currentOptions = [];
  }

  removeQuestion(index: number) {
    if (this.editingQuestionIndex === index) {
      this.cancelEditQuestion();
    } else if (this.editingQuestionIndex !== null && this.editingQuestionIndex > index) {
      this.editingQuestionIndex--;
    }
    this.questions.splice(index, 1);
  }

  generateQuizWithAI() {
    const topic = this.quizForm.title || 'General Knowledge';
    if (!this.quizForm.title) {
      this.toastr.info(
        'Using default topic for AI generation. Give the quiz a title for better results!',
      );
    }

    this.isGeneratingQuiz = true;
    this.toastr.info('AI is generating questions... Please wait.');

    this.aiService.generateQuiz(topic, 'Intermediate', 5).subscribe({
      next: (res: any) => {
        const aiQuiz = res.data || res;

        // Auto-fill title/description if empty
        if (!this.quizForm.title && aiQuiz.title) {
          this.quizForm.title = aiQuiz.title;
        }
        if (!this.quizForm.description && aiQuiz.description) {
          this.quizForm.description = aiQuiz.description;
        }

        // Map AI questions to our builder format
        if (aiQuiz.questions && aiQuiz.questions.length > 0) {
          aiQuiz.questions.forEach((q: any) => {
            this.questions.push({
              text: q.text,
              points: q.points || 10,
              questionType: q.questionType || 'SingleChoice',
              options: q.options.map((o: any) => ({
                optionText: o.optionText,
                isCorrect: o.isCorrect,
              })),
            });
          });
          this.toastr.success(`AI successfully generated ${aiQuiz.questions.length} questions!`);
        } else {
          this.toastr.warning('AI returned empty questions. Try again.');
        }

        this.isGeneratingQuiz = false;
      },
      error: (err: any) => {
        this.toastr.error(err.error?.message || 'Failed to generate quiz with AI.');
        this.isGeneratingQuiz = false;
        console.error(err);
      },
    });
  }

  saveQuiz() {
    if (!this.selectedCourseId) {
      this.toastr.error('Please select a course to attach the quiz to.');
      return;
    }
    if (!this.quizForm.title) {
      this.toastr.warning('Quiz Title is required.');
      return;
    }
    if (this.questions.length === 0) {
      this.toastr.warning('You must add at least one question to save the quiz.');
      return;
    }

    const payload = {
      courseId: this.selectedCourseId,
      title: this.quizForm.title,
      description: this.quizForm.description,
      passingScore: this.quizForm.passingScore,
      isFinal: this.quizForm.isFinal,
      questions: this.questions,
    };

    this.isSubmitting = true;
    this.quizService.createQuiz(payload).subscribe({
      next: (res: any) => {
        this.toastr.success('Quiz published successfully!');
        this.router.navigate(['/dashboard']);
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.toastr.error(err.error?.message || 'Failed to save quiz.');
        this.isSubmitting = false;
        console.error(err);
      },
    });
  }

  goBack() {
    this.router.navigate(['/trainer/course-creator']);
  }
}
