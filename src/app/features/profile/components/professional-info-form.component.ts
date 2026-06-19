import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-professional-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="glass-card p-4">
      <div class="d-flex align-items-center justify-content-between mb-4 border-bottom border-light border-opacity-10 pb-3">
        <h5 class="fw-bold mb-0 text-white d-flex align-items-center gap-2">
          <i class="bi bi-briefcase-fill text-primary"></i> Professional Information
        </h5>
        @if (formGroup.dirty || skillsChanged()) {
          <span class="badge bg-warning text-black animate-pulse">Unsaved Changes</span>
        }
      </div>

      <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
        <div class="row g-3.5">
          
          <!-- Designation -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Designation / Job Title</label>
            <input type="text" formControlName="designation" class="form-control premium-input" 
                   placeholder="e.g. Lead Frontend Architect" />
          </div>

          <!-- Organization -->
          <div class="col-md-6">
            <label class="form-label text-secondary small fw-bold">Organization / Company</label>
            <input type="text" formControlName="organization" class="form-control premium-input" 
                   placeholder="e.g. Google DeepMind" />
          </div>

          <!-- Experience Level -->
          <div class="col-md-12">
            <label class="form-label text-secondary small fw-bold">Experience Level</label>
            <select formControlName="experienceLevel" class="form-select premium-input">
              <option value="Beginner">Beginner (0-2 years)</option>
              <option value="Intermediate">Intermediate (2-5 years)</option>
              <option value="Advanced">Advanced (5-8 years)</option>
              <option value="Expert">Expert (8+ years)</option>
            </select>
          </div>

          <!-- Skills Tags (Chips Input) -->
          <div class="col-md-12">
            <label class="form-label text-secondary small fw-bold">Skills & Technologies</label>
            <div class="skills-input-wrapper p-2.5 rounded-3 d-flex flex-wrap align-items-center gap-2">
              
              <!-- Chips -->
              @for (skill of skills(); track skill) {
                <span class="skill-chip d-flex align-items-center gap-1.5 px-2.5 py-1 rounded">
                  <span class="small text-white fw-medium">{{ skill }}</span>
                  <button type="button" class="btn p-0 border-0 text-secondary hover-text-danger" 
                          (click)="removeSkill(skill)">
                    <i class="bi bi-x-circle-fill"></i>
                  </button>
                </span>
              }

              <!-- Input text for adding skills -->
              <input type="text" 
                     [value]="newSkillInput()" 
                     (input)="onSkillInput($event)"
                     (keydown.enter)="$event.preventDefault(); addSkill()" 
                     placeholder="Type skill & press Enter" 
                     class="flex-grow-1 border-0 bg-transparent text-white small p-1 focus-outline-none" 
                     style="outline: none; min-width: 150px;" />
            </div>
            <div class="text-secondary small mt-1.5 opacity-60">
              Press Enter or comma to add a skill tag.
            </div>
          </div>

          <!-- Biography (Character Counter 500) -->
          <div class="col-md-12">
            <div class="d-flex justify-content-between align-items-center">
              <label class="form-label text-secondary small fw-bold mb-1">Biography / About Me</label>
              <span class="small text-secondary fw-semibold" [class.text-danger]="bioCharCount() > 500">
                {{ bioCharCount() }}/500
              </span>
            </div>
            <textarea formControlName="biography" class="form-control premium-input" rows="4" 
                      placeholder="Share a brief description of your professional background, learning targets, and interests..." 
                      [class.is-invalid]="isFieldInvalid('biography')"></textarea>
            <div class="invalid-feedback">Biography cannot exceed 500 characters.</div>
          </div>

          <!-- Social Links Section -->
          <div class="col-md-12 mt-4 pt-3 border-top border-light border-opacity-10">
            <h6 class="fw-bold text-white small mb-3 text-uppercase" style="letter-spacing: 1px;">
              Social & Web Links
            </h6>
            
            <div class="row g-3">
              <!-- LinkedIn -->
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text social-icon-prefix bg-dark text-primary border-light border-opacity-10">
                    <i class="bi bi-linkedin"></i>
                  </span>
                  <input type="url" formControlName="linkedinUrl" class="form-control premium-input border-start-0" 
                         [class.is-invalid]="isFieldInvalid('linkedinUrl')" placeholder="https://linkedin.com/in/..." />
                  <div class="invalid-feedback">Enter a valid URL.</div>
                </div>
              </div>

              <!-- GitHub -->
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text social-icon-prefix bg-dark text-white border-light border-opacity-10">
                    <i class="bi bi-github"></i>
                  </span>
                  <input type="url" formControlName="githubUrl" class="form-control premium-input border-start-0" 
                         [class.is-invalid]="isFieldInvalid('githubUrl')" placeholder="https://github.com/..." />
                  <div class="invalid-feedback">Enter a valid URL.</div>
                </div>
              </div>

              <!-- Portfolio -->
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text social-icon-prefix bg-dark text-info border-light border-opacity-10">
                    <i class="bi bi-globe"></i>
                  </span>
                  <input type="url" formControlName="portfolioUrl" class="form-control premium-input border-start-0" 
                         [class.is-invalid]="isFieldInvalid('portfolioUrl')" placeholder="https://mywebsite.com" />
                  <div class="invalid-feedback">Enter a valid URL.</div>
                </div>
              </div>

              <!-- Twitter / X -->
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text social-icon-prefix bg-dark text-white border-light border-opacity-10">
                    <i class="bi bi-twitter-x"></i>
                  </span>
                  <input type="url" formControlName="twitterUrl" class="form-control premium-input border-start-0" 
                         [class.is-invalid]="isFieldInvalid('twitterUrl')" placeholder="https://x.com/..." />
                  <div class="invalid-feedback">Enter a valid URL.</div>
                </div>
              </div>

              <!-- YouTube -->
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text social-icon-prefix bg-dark text-danger border-light border-opacity-10">
                    <i class="bi bi-youtube"></i>
                  </span>
                  <input type="url" formControlName="youtubeUrl" class="form-control premium-input border-start-0" 
                         [class.is-invalid]="isFieldInvalid('youtubeUrl')" placeholder="https://youtube.com/..." />
                </div>
              </div>

              <!-- Instagram -->
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text social-icon-prefix bg-dark text-warning border-light border-opacity-10">
                    <i class="bi bi-instagram"></i>
                  </span>
                  <input type="url" formControlName="instagramUrl" class="form-control premium-input border-start-0" 
                         [class.is-invalid]="isFieldInvalid('instagramUrl')" placeholder="https://instagram.com/..." />
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- Form Actions -->
        <div class="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-light border-opacity-10">
          <button type="button" class="btn btn-outline-light border-opacity-20 text-secondary" 
                  [disabled]="(!formGroup.dirty && !skillsChanged()) || loading" 
                  (click)="onReset()">
            Reset
          </button>
          <button type="submit" class="btn btn-primary d-flex align-items-center gap-1.5" 
                  [disabled]="formGroup.invalid || (!formGroup.dirty && !skillsChanged()) || loading || bioCharCount() > 500">
            @if (loading) {
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Saving...</span>
            } @else {
              <i class="bi bi-check-circle-fill"></i>
              <span>Save Changes</span>
            }
          </button>
        </div>
      </form>

    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(13, 17, 23, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
    }
    .premium-input {
      background: rgba(5, 5, 5, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff !important;
      border-radius: 10px;
      padding: 0.65rem 0.85rem;
      transition: all 0.25s ease;
    }
    .premium-input:focus {
      background: rgba(13, 17, 23, 0.9);
      border-color: var(--primary-color, #9FEF00);
      box-shadow: 0 0 0 3px rgba(159, 239, 0, 0.15);
      outline: none;
    }
    .premium-input::placeholder {
      color: rgba(255, 255, 255, 0.25);
    }
    .social-icon-prefix {
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px 0 0 10px;
      font-size: 1.1rem;
    }
    .input-group .premium-input {
      border-radius: 0 10px 10px 0;
    }
    .skills-input-wrapper {
      background: rgba(5, 5, 5, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      min-height: 48px;
      transition: border-color 0.25s ease;
    }
    .skills-input-wrapper:focus-within {
      border-color: var(--primary-color, #9FEF00);
      box-shadow: 0 0 0 3px rgba(159, 239, 0, 0.15);
    }
    .skill-chip {
      background: rgba(159, 239, 0, 0.1);
      border: 1px solid rgba(159, 239, 0, 0.2);
    }
    .skill-chip span {
      color: var(--primary-hover-color, #B8FF36) !important;
    }
    .hover-text-danger:hover {
      color: #FF4D4F !important;
    }
    .animate-pulse {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `]
})
export class ProfessionalInfoFormComponent implements OnInit, OnChanges {
  @Input() profile: any = {};
  @Input() loading = false;
  
  @Output() save = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  formGroup!: FormGroup;
  skills = signal<string[]>([]);
  skillsChanged = signal(false);
  newSkillInput = signal('');
  bioCharCount = signal(0);

  ngOnInit() {
    this.initForm();
    this.skills.set([...(this.profile.skills || [])]);
    this.bioCharCount.set(this.profile.biography?.length || 0);

    // Watch biography to count chars
    this.formGroup.get('biography')?.valueChanges.subscribe(val => {
      this.bioCharCount.set(val?.length || 0);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['profile'] && this.formGroup) {
      this.formGroup.patchValue(this.profile);
      this.skills.set([...(this.profile.skills || [])]);
      this.skillsChanged.set(false);
      this.bioCharCount.set(this.profile.biography?.length || 0);
    }
  }

  private initForm() {
    // Regex for basic URL validation
    const urlPattern = 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)';

    this.formGroup = this.fb.group({
      designation: [this.profile.designation || ''],
      organization: [this.profile.organization || ''],
      experienceLevel: [this.profile.experienceLevel || 'Intermediate'],
      biography: [this.profile.biography || '', [Validators.maxLength(500)]],
      linkedinUrl: [this.profile.linkedinUrl || '', [Validators.pattern(urlPattern)]],
      githubUrl: [this.profile.githubUrl || '', [Validators.pattern(urlPattern)]],
      portfolioUrl: [this.profile.portfolioUrl || '', [Validators.pattern(urlPattern)]],
      twitterUrl: [this.profile.twitterUrl || '', [Validators.pattern(urlPattern)]],
      youtubeUrl: [this.profile.youtubeUrl || ''],
      instagramUrl: [this.profile.instagramUrl || '']
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.formGroup.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSkillInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    if (val.endsWith(',')) {
      this.newSkillInput.set(val.slice(0, -1));
      this.addSkill();
    } else {
      this.newSkillInput.set(val);
    }
  }

  addSkill() {
    const val = this.newSkillInput().trim();
    if (val) {
      if (this.skills().includes(val)) {
        this.toastr.warning('Skill tag already added.');
        return;
      }
      this.skills.update(prev => [...prev, val]);
      this.newSkillInput.set('');
      this.skillsChanged.set(true);
    }
  }

  removeSkill(skill: string) {
    this.skills.update(prev => prev.filter(s => s !== skill));
    this.skillsChanged.set(true);
  }

  onSubmit() {
    if (this.formGroup.valid) {
      const payload = {
        ...this.formGroup.value,
        skills: this.skills()
      };
      this.save.emit(payload);
    } else {
      this.toastr.error('Please resolve validation errors before saving.');
    }
  }

  onReset() {
    this.formGroup.reset(this.profile);
    this.skills.set([...(this.profile.skills || [])]);
    this.skillsChanged.set(false);
  }
}
