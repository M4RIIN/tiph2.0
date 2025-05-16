import { Goal } from '../entities/Goal';
import { UserReward } from '../entities/UserReward';

export interface GoalService {
  updateGoalProgress(goal: Goal, pointsAdded: number): void;
  checkGoalCompletion(goal: Goal): boolean;
  assignRewardForCompletedGoal(goal: Goal, userRewards: UserReward[]): UserReward | null;
}

export class GoalServiceImpl implements GoalService {
  /**
   * Update a goal's progress with newly earned points
   */
  updateGoalProgress(goal: Goal, pointsAdded: number): void {
    if (goal.completed) {
      return; // Goal already completed, no need to update
    }

    goal.addPoints(pointsAdded);
  }

  /**
   * Check if a goal is completed
   */
  checkGoalCompletion(goal: Goal): boolean {
    return goal.isCompleted();
  }

  /**
   * Assign a reward to the user when a goal is completed
   * Returns the created/updated UserReward or null if no reward is associated with the goal
   */
  assignRewardForCompletedGoal(goal: Goal, userRewards: UserReward[]): UserReward | null {
    // If goal is not completed or has no associated reward, return null
    if (!goal.completed || !goal.rewardId) {
      return null;
    }

    // Check if user already has this reward
    const userReward = userRewards.find(ur => ur.rewardId === goal.rewardId && ur.userId === goal.userId);

    // If user doesn't have this reward yet, we would normally create it here
    // But since we don't have a repository to save it, we'll just return null
    if (!userReward) {
      return null;
    }

    // Unlock the reward if it's not already unlocked
    if (!userReward.unlocked) {
      userReward.unlock();
    }

    return userReward;
  }
}
