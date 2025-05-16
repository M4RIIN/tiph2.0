
import { Goal } from '../../domain/entities/Goal';
import { PointsService } from '../../domain/services/PointsService';
import { GoalService } from '../../domain/services/GoalService';
import {GoalRepository} from "@/domain/repositories/GoalRepository";
import {UserRewardRepository} from "@/domain/repositories/UserRewardRepository";
import {WorkoutSessionRepository} from "@/domain/repositories/WorkoutSessionRepository";
import {UserRepository} from "@/domain/repositories/UserRepository";

export interface TrackPointsUseCase {
  trackWeeklyPoints(userId: string, weekStartDate: Date): Promise<number>;
  updateGoalsProgress(userId: string, pointsEarned: number): Promise<Goal[]>;
}

export class TrackPointsUseCaseImpl implements TrackPointsUseCase {
  constructor(
    private readonly pointsService: PointsService,
    private readonly goalService: GoalService,
    private readonly userRepository: UserRepository,
    private readonly workoutSessionRepository: WorkoutSessionRepository,
    private readonly goalRepository: GoalRepository,
    private readonly userRewardRepository: UserRewardRepository,
  ) {}

  /**
   * Track weekly points for a user and update their total points
   * Returns the number of points earned for the week
   */
  async trackWeeklyPoints(userId: string, weekStartDate: Date): Promise<number> {
    // Get user and their workout sessions
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // const sessions = await this.workoutSessionRepository.getSessionsByUserId(userId);
    
    // Calculate and award points
    const pointsBefore = user.points;
    // this.pointsService.awardPointsForWeek(user, sessions, weekStartDate);
    await this.pointsService.awardPointsForWeek(user.id, weekStartDate);
    const pointsEarned = user.points - pointsBefore;
    
    // Save updated user
    if (pointsEarned > 0) {
      await this.userRepository.create(user);
      
      // Update goals progress
      await this.updateGoalsProgress(userId, pointsEarned);
    }
    
    return pointsEarned;
  }

  /**
   * Update the progress of all goals for a user based on points earned
   * Returns the updated goals
   */
  async updateGoalsProgress(userId: string, pointsEarned: number): Promise<Goal[]> {
    if (pointsEarned <= 0) {
      return [];
    }
    
    // Get user's goals and rewards
    const goals = await this.goalRepository.getGoalsByUserId(userId);
    const userRewards = await this.userRewardRepository.getUserRewardsByUserId(userId);
    
    // Update each goal's progress
    const updatedGoals: Goal[] = [];
    
    for (const goal of goals) {
      if (!goal.completed) {
        // Update goal progress
        this.goalService.updateGoalProgress(goal, pointsEarned);
        
        // Check if goal is completed and has a reward
        if (goal.completed && goal.rewardId) {
          // Assign reward
          const userReward = this.goalService.assignRewardForCompletedGoal(goal, userRewards);
          
          // Save user reward if it was updated
          if (userReward && userReward.unlocked) {
            await this.userRewardRepository.create(userReward);
          }
        }
        
        // Save updated goal
        await this.goalRepository.create(goal);
        updatedGoals.push(goal);
      }
    }
    
    return updatedGoals;
  }
}