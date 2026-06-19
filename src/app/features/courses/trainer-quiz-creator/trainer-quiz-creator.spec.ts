import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerQuizCreator } from './trainer-quiz-creator';

describe('TrainerQuizCreator', () => {
  let component: TrainerQuizCreator;
  let fixture: ComponentFixture<TrainerQuizCreator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerQuizCreator],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainerQuizCreator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
