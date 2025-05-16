import { Goal, GoalImpl } from '../../domain/entities/Goal';
import {GoalRepository} from "@/domain/repositories/GoalRepository";
import {RewardRepository} from "@/domain/repositories/RewardRepository";

export interface CreateGoalDto {
  userId: string;
  name: string;
  pointsRequired: number;
  description?: string;
  rewardId?: string;
}

export interface UpdateGoalDto {
  name?: string;
  pointsRequired?: number;
  description?: string;
  rewardId?: string;
}

export interface ManageGoalsUseCase {
  createGoal(dto: CreateGoalDto): Promise<Goal>;
  updateGoal(id: string, dto: UpdateGoalDto): Promise<Goal>;
  getGoalById(id: string): Promise<Goal>;
  getGoalsByUserId(userId: string): Promise<Goal[]>;
  getCompletedGoals(userId: string): Promise<Goal[]>;
  resetGoal(id: string): Promise<Goal>;
}

export class ManageGoalsUseCaseImpl implements ManageGoalsUseCase {
  constructor(
    private readonly goalRepository: GoalRepository,
    private readonly rewardRepository: RewardRepository,
    private readonly idGenerator: {
      generate: () => string;
    }
  ) {}

  /**
   * Create a new goal for a user
   */
  async createGoal(dto: CreateGoalDto): Promise<Goal> {
    // Validate reward if provided
    if (dto.rewardId) {
      const reward = await this.rewardRepository.getById(dto.rewardId);
      if (!reward) {
        throw new Error(`Reward with ID ${dto.rewardId} not found`);
      }
    }

    // Create new goal
    const goal = new GoalImpl(
      this.idGenerator.generate(),
      dto.userId,
      dto.name,
      dto.pointsRequired,
      0, // pointsAccumulated starts at 0
      false, // completed starts as false
      dto.description,
      dto.rewardId
    );

    // Save and return the goal
    return this.goalRepository.create(goal);
  }

  /**
   * Update an existing goal
   */
  async updateGoal(id: string, dto: UpdateGoalDto): Promise<Goal> {
    // Find the goal
    const goal = await this.goalRepository.getById(id);
    if (!goal) {
      throw new Error(`Goal with ID ${id} not found`);
    }

    // Validate reward if provided
    if (dto.rewardId) {
      const reward = await this.rewardRepository.getById(dto.rewardId);
      if (!reward) {
        throw new Error(`Reward with ID ${dto.rewardId} not found`);
      }
    }

    // Update goal details
    goal.updateDetails(
      dto.name,
      dto.pointsRequired,
      dto.description,
      dto.rewardId
    );

    // Save and return the updated goal
    return this.goalRepository.create(goal);
  }

  /**
   * Get a goal by ID
   */
  async getGoalById(id: string): Promise<Goal> {
    const goal = await this.goalRepository.getById(id);
    if (!goal) {
      throw new Error(`Goal with ID ${id} not found`);
    }
    return goal;
  }

  /**
   * Get all goals for a user
   */
  async getGoalsByUserId(userId: string): Promise<Goal[]> {
    return this.goalRepository.getGoalsByUserId(userId);
  }

  /**
   * Get completed goals for a user
   */
  async getCompletedGoals(userId: string): Promise<Goal[]> {
    const goals = await this.goalRepository.getGoalsByUserId(userId);
    return goals.filter(goal => goal.completed);
  }

  /**
   * Reset a goal (set points accumulated to 0 and completed to false)
   */
  async resetGoal(id: string): Promise<Goal> {
    const goal = await this.goalRepository.getById(id);
    if (!goal) {
      throw new Error(`Goal with ID ${id} not found`);
    }

    goal.reset();
    return this.goalRepository.create(goal);
  }
}