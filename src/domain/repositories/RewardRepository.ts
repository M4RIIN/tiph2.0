import { Repository } from './Repository';
import { Reward, RewardTier } from '../entities/Reward';

export interface RewardRepository extends Repository<Reward> {
  getRewardsByTier(tier: RewardTier): Promise<Reward[]>;
  getRewardsByPointsCost(minPoints: number, maxPoints?: number): Promise<Reward[]>;
  getPredefinedRewards(): Promise<Reward[]>;
}