import { WorkoutSessionRepository } from '@/domain/repositories/WorkoutSessionRepository';
import { WorkoutSession, WorkoutSessionImpl, WorkoutType } from '@/domain/entities/WorkoutSession';
import { FirebaseRepository } from './FirebaseRepository';
import { db } from '@/infrastructure/firebase/config';
import { DocumentData, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

export class FirebaseWorkoutSessionRepository extends FirebaseRepository<WorkoutSession> implements WorkoutSessionRepository {
  protected collectionName = 'workoutSessions';

  protected fromFirestore(data: DocumentData, id: string): WorkoutSession {
    const sessionData = this.convertTimestampsToDates(data) as Record<string, unknown>;

    return new WorkoutSessionImpl(
      id,
      sessionData.userId as string,
      sessionData.type as WorkoutType,
      sessionData.date as Date,
      sessionData.duration as number,
      sessionData.programId as string | undefined,
      sessionData.notes as string | undefined,
      sessionData.createdAt as Date,
      sessionData.updatedAt as Date
    );
  }

  protected toFirestore(entity: WorkoutSession): DocumentData {
    return this.convertDatesToTimestamps({
      userId: entity.userId,
      type: entity.type,
      date: entity.date,
      duration: entity.duration,
      programId: entity.programId,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }

  async getSessionsByUserId(userId: string): Promise<WorkoutSession[]> {
    const sessionsRef = collection(db, this.collectionName);
    const q = query(sessionsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => this.fromFirestore(doc.data(), doc.id));
  }

  async getSessionsByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkoutSession[]> {
    const sessionsRef = collection(db, this.collectionName);
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => this.fromFirestore(doc.data(), doc.id));
  }

  async getSessionsByProgramId(programId: string): Promise<WorkoutSession[]> {
    const sessionsRef = collection(db, this.collectionName);
    const q = query(sessionsRef, where('programId', '==', programId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => this.fromFirestore(doc.data(), doc.id));
  }
}
