import { Reward, RewardTier, PREDEFINED_REWARDS } from '../../domain/entities/Reward';
import { UserReward, UserRewardImpl } from '../../domain/entities/UserReward';
import {RewardRepository} from "@/domain/repositories/RewardRepository";
import {UserRepository} from "@/domain/repositories/UserRepository";
import {UserRewardRepository} from "@/domain/repositories/UserRewardRepository";

export interface CreateRewardDto {
  name: string;
  description: string;
  tier: RewardTier;
  pointsCost: number;
  imageUrl?: string;
}

export interface UpdateRewardDto {
  name?: string;
  description?: string;
  tier?: RewardTier;
  pointsCost?: number;
  imageUrl?: string;
}

export interface ManageRewardsUseCase {
  createReward(dto: CreateRewardDto): Promise<Reward>;
  updateReward(id: string, dto: UpdateRewardDto): Promise<Reward>;
  getRewardById(id: string): Promise<Reward>;
  getAllRewards(): Promise<Reward[]>;
  getUserRewards(userId: string): Promise<UserReward[]>;
  getUnlockedRewards(userId: string): Promise<Reward[]>;
  unlockReward(userId: string, rewardId: string): Promise<UserReward>;
  initializePredefinedRewards(): Promise<Reward[]>;
}

export class ManageRewardsUseCaseImpl implements ManageRewardsUseCase {
  constructor(
    private readonly rewardRepository: RewardRepository,
    private readonly userRewardRepository: UserRewardRepository,
    private readonly userRepository: UserRepository,
    private readonly idGenerator: {
      generate: () => string;
    }
  ) {}

  /**
   * Create a new reward
   */
  async createReward(dto: CreateRewardDto): Promise<Reward> {
    const reward = new Reward(
      this.idGenerator.generate(),
      dto.name,
      dto.description,
      dto.tier,
      dto.pointsCost,
      dto.imageUrl || "",
      new Date(),
      new Date()
    );

    return this.rewardRepository.create(reward);
  }

  /**
   * Update an existing reward
   */
  async updateReward(id: string, dto: UpdateRewardDto): Promise<Reward> {
    const reward = await this.rewardRepository.getById(id);
    if (!reward) {
      throw new Error(`Reward with ID ${id} not found`);
    }

    reward.updateDetails(
      dto.name,
      dto.description,
      dto.tier,
      dto.pointsCost,
      dto.imageUrl
    );

    return this.rewardRepository.create(reward);
  }

  /**
   * Get a reward by ID
   */
  async getRewardById(id: string): Promise<Reward> {
    const reward = await this.rewardRepository.getById(id);
    if (!reward) {
      throw new Error(`Reward with ID ${id} not found`);
    }
    return reward;
  }

  /**
   * Get all rewards
   */
  async getAllRewards(): Promise<Reward[]> {
    return this.rewardRepository.getAll();
  }

  /**
   * Get all user rewards (both locked and unlocked)
   */
  async getUserRewards(userId: string): Promise<UserReward[]> {
    return this.userRewardRepository.getUserRewardsByUserId(userId);
  }

  /**
   * Get all unlocked rewards for a user
   */
  async getUnlockedRewards(userId: string): Promise<Reward[]> {
    const userRewards = await this.userRewardRepository.getUserRewardsByUserId(userId);
    const unlockedUserRewards = userRewards.filter(ur => ur.unlocked);
    
    const rewards: Reward[] = [];
    for (const userReward of unlockedUserRewards) {
      const reward = await this.rewardRepository.getById(userReward.rewardId);
      if (reward) {
        rewards.push(reward);
      }
    }
    
    return rewards;
  }

  /**
   * Unlock a reward for a user (if they have enough points)
   */
  async unlockReward(userId: string, rewardId: string): Promise<UserReward> {
    // Get user and reward
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const reward = await this.rewardRepository.getById(rewardId);
    if (!reward) {
      throw new Error(`Reward with ID ${rewardId} not found`);
    }
    
    // Check if user already has this reward
    let userReward = await this.userRewardRepository.getUserRewardByUserIdAndRewardId(userId, rewardId);
    
    // If user doesn't have this reward yet, create it
    if (!userReward) {
      userReward = new UserRewardImpl(
        this.idGenerator.generate(),
        userId,
        rewardId
      );
    }
    
    // If reward is already unlocked, just return it
    if (userReward.unlocked) {
      return userReward;
    }
    
    // Check if user has enough points
    if (user.points < reward.pointsCost) {
      throw new Error(`User does not have enough points to unlock this reward. Required: ${reward.pointsCost}, Available: ${user.points}`);
    }
    
    // Use points and unlock reward
    const success = user.usePoints(reward.pointsCost);
    if (!success) {
      throw new Error('Failed to use points');
    }
    
    userReward.unlock();
    
    // Save changes
    await this.userRepository.create(user);
    return this.userRewardRepository.create(userReward);
  }

  /**
   * Initialize the predefined rewards in the database
   */
  async initializePredefinedRewards(): Promise<Reward[]> {
    const savedRewards: Reward[] = [];
    
    for (const rewardData of PREDEFINED_REWARDS) {
      // Check if reward already exists (by name)
      const existingRewards = await this.rewardRepository.getAll();
      const existingReward = existingRewards.find(r => r.name === rewardData.name);
      
      if (!existingReward) {
        // Create new reward with generated ID
        const reward = new Reward(
          this.idGenerator.generate(),
          rewardData.name,
          rewardData.description,
          rewardData.tier,
          rewardData.pointsCost,
          rewardData.imageUrl || "",
          rewardData.createdAt,
          rewardData.updatedAt
        );
        
        const savedReward = await this.rewardRepository.create(reward);
        savedRewards.push(savedReward);
      } else {
        savedRewards.push(existingReward);
      }
    }
    
    return savedRewards;
  }
}