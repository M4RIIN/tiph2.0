import { Repository } from './Repository';
import { UserReward } from '../entities/UserReward';

export interface UserRewardRepository extends Repository<UserReward> {
  getUserRewardsByUserId(userId: string): Promise<UserReward[]>;
  getUserRewardByUserIdAndRewardId(userId: string, rewardId: string): Promise<UserReward | null>;
  unlockReward(userId: string, rewardId: string): Promise<UserReward>;
  getUnlockedRewardIds(userId: string): Promise<string[]>;
}