import { ProgramRepository } from '@/domain/repositories/ProgramRepository';
import { Program, ProgramExercise, ProgramImpl } from '@/domain/entities/Program';
import { WorkoutType } from '@/domain/entities/WorkoutSession';
import { FirebaseRepository } from './FirebaseRepository';
import { db } from '@/infrastructure/firebase/config';
import { DocumentData, collection, getDocs, query, where } from 'firebase/firestore';

export class FirebaseProgramRepository extends FirebaseRepository<Program> implements ProgramRepository {
  save(program: Program): Promise<Program> {
      return this.create(program);
  }

  protected collectionName = 'programs';

  protected fromFirestore(data: DocumentData, id: string): Program {
    const programData = this.convertTimestampsToDates(data) as Record<string, unknown>;

    return new ProgramImpl(
      id,
      programData.userId as string,
      programData.name as string,
      programData.type as WorkoutType,
      programData.exercises as ProgramExercise[],
      programData.description as string | undefined,
      programData.createdAt as Date,
      programData.updatedAt as Date
    );
  }

  protected toFirestore(entity: Program): DocumentData {
    return this.convertDatesToTimestamps({
      userId: entity.userId,
      name: entity.name,
      type: entity.type,
      description: entity.description,
      exercises: entity.exercises,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }

  async getProgramsByUserId(userId: string): Promise<Program[]> {
    const programsRef = collection(db, this.collectionName);
    const q = query(programsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => this.fromFirestore(doc.data(), doc.id));
  }

  async addExerciseToProgram(programId: string, exercise: ProgramExercise): Promise<Program> {
    const program = await this.getById(programId);

    if (!program) {
      throw new Error(`Program with ID ${programId} not found`);
    }

    const updatedProgram = {
      ...program,
      exercises: [...program.exercises, exercise],
      updatedAt: new Date()
    };

    return this.update(programId, updatedProgram);
  }

  async removeExerciseFromProgram(programId: string, exerciseName: string): Promise<Program> {
    const program = await this.getById(programId);

    if (!program) {
      throw new Error(`Program with ID ${programId} not found`);
    }

    const updatedProgram = {
      ...program,
      exercises: program.exercises.filter(e => e.name !== exerciseName),
      updatedAt: new Date()
    };

    return this.update(programId, updatedProgram);
  }
}
