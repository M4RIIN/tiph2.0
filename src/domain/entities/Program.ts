import { WorkoutType } from './WorkoutSession';

export interface ProgramExercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number; // in kg, optional for exercises like yoga, pilates
  duration?: number; // in minutes, optional for timed exercises
  notes?: string;
}

export interface Program {
  id: string;
  userId: string;
  name: string;
  type: WorkoutType;
  description?: string;
  exercises: ProgramExercise[];
  createdAt: Date;
  updatedAt: Date;
  addExercise(exercise: ProgramExercise): void;
  removeExercise(exerciseName: string): void;
  updateExercise(exerciseName: string, updatedExercise: Partial<ProgramExercise>): void;
  updateDetails(
      name?: string,
      type?: WorkoutType,
      description?: string
  ): void
}

export class ProgramImpl implements Program {
  constructor(
    public id: string,
    public userId: string,
    public name: string,
    public type: WorkoutType,
    public exercises: ProgramExercise[] = [],
    public description?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  addExercise(exercise: ProgramExercise): void {
    this.exercises.push(exercise);
    this.updatedAt = new Date();
  }

  removeExercise(exerciseName: string): void {
    this.exercises = this.exercises.filter(e => e.name !== exerciseName);
    this.updatedAt = new Date();
  }

  updateExercise(exerciseName: string, updatedExercise: Partial<ProgramExercise>): void {
    const index = this.exercises.findIndex(e => e.name === exerciseName);
    if (index !== -1) {
      this.exercises[index] = { ...this.exercises[index], ...updatedExercise };
      this.updatedAt = new Date();
    }
  }

  updateDetails(
    name?: string,
    type?: WorkoutType,
    description?: string
  ): void {
    if (name) this.name = name;
    if (type) this.type = type;
    if (description !== undefined) this.description = description;
    this.updatedAt = new Date();
  }
}