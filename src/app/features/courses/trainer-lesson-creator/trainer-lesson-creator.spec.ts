import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerLessonCreator } from './trainer-lesson-creator';

describe('TrainerLessonCreator', () => {
  let component: TrainerLessonCreator;
  let fixture: ComponentFixture<TrainerLessonCreator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerLessonCreator],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainerLessonCreator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
