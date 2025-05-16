export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  unlocked: boolean;
  unlockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  unlock(): void;
  isUnlocked(): boolean;
}

export class UserRewardImpl implements UserReward {
  constructor(
    public id: string,
    public userId: string,
    public rewardId: string,
    public unlocked: boolean = false,
    public unlockedAt?: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Unlock the reward
  unlock(): void {
    if (!this.unlocked) {
      this.unlocked = true;
      this.unlockedAt = new Date();
      this.updatedAt = new Date();
    }
  }

  // Check if the reward is unlocked
  isUnlocked(): boolean {
    return this.unlocked;
  }
}