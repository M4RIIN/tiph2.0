import { Repository } from './Repository';
import { WorkoutSession } from '../entities/WorkoutSession';

export interface WorkoutSessionRepository extends Repository<WorkoutSession> {
  getSessionsByUserId(userId: string): Promise<WorkoutSession[]>;
  getSessionsByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkoutSession[]>;
  getSessionsByProgramId(programId: string): Promise<WorkoutSession[]>;
}