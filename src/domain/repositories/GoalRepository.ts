import { Repository } from './Repository';
import { Goal } from '../entities/Goal';

export interface GoalRepository extends Repository<Goal> {
  getGoalsByUserId(userId: string): Promise<Goal[]>;
  getCompletedGoalsByUserId(userId: string): Promise<Goal[]>;
  getIncompleteGoalsByUserId(userId: string): Promise<Goal[]>;
  updateGoalProgress(goalId: string, pointsAdded: number): Promise<Goal>;
}