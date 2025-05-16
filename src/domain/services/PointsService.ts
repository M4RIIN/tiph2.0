import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import { WorkoutSessionRepository } from '../repositories/WorkoutSessionRepository';

export interface PointsService {
  calculateWeeklyPoints(userId: string, weekStartDate: Date): Promise<number>;
  awardPointsForWeek(userId: string, weekStartDate: Date): Promise<User>;
}

export class PointsServiceImpl implements PointsService {
  constructor(
    private userRepository: UserRepository,
    private workoutSessionRepository: WorkoutSessionRepository
  ) {}

  /**
   * Calculate points earned for a specific week based on workout sessions
   * Rule: 1 point for every 3 workout sessions in a week
   */
  async calculateWeeklyPoints(userId: string, weekStartDate: Date): Promise<number> {
    // Get the end date of the week (7 days after start)
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Get sessions for the specific user and week
    const userSessionsInWeek = await this.workoutSessionRepository.getSessionsByUserIdAndDateRange(
      userId, 
      weekStartDate, 
      weekEndDate
    );

    // Calculate points: 1 point for every 3 sessions
    const sessionCount = userSessionsInWeek.length;
    const points = Math.floor(sessionCount / 3);

    return points;
  }

  /**
   * Award points to a user based on their workout sessions in a specific week
   */
  async awardPointsForWeek(userId: string, weekStartDate: Date): Promise<User> {
    const pointsEarned = await this.calculateWeeklyPoints(userId, weekStartDate);

    if (pointsEarned > 0) {
      return this.userRepository.updateUserPoints(userId, pointsEarned);
    }

    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user;
  }
}
