import { Repository } from './Repository';
import { Program, ProgramExercise } from '../entities/Program';

export interface ProgramRepository extends Repository<Program> {
  getProgramsByUserId(userId: string): Promise<Program[]>;
  addExerciseToProgram(programId: string, exercise: ProgramExercise): Promise<Program>;
  removeExerciseFromProgram(programId: string, exerciseName: string): Promise<Program>;
  save(program: Program): Promise<Program>;
}
