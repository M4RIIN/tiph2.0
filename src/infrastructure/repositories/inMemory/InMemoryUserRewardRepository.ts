import { UserReward, UserRewardImpl } from "@/domain/entities/UserReward";
import { UserRewardRepository } from "@/domain/repositories/UserRewardRepository";

export class InMemoryUserRewardRepository implements UserRewardRepository {
    private userRewards: UserReward[] = [];

    getUserRewardsByUserId(userId: string): Promise<UserReward[]> {
        return Promise.resolve(this.userRewards.filter(ur => ur.userId === userId));
    }

    getUserRewardByUserIdAndRewardId(userId: string, rewardId: string): Promise<UserReward | null> {
        const userReward = this.userRewards.find(ur => ur.userId === userId && ur.rewardId === rewardId);
        return Promise.resolve(userReward ?? null);
    }

    unlockReward(userId: string, rewardId: string): Promise<UserReward> {
        let userReward = this.userRewards.find(ur => ur.userId === userId && ur.rewardId === rewardId);
        
        if (!userReward) {
            // Create a new user reward if it doesn't exist
            userReward = new UserRewardImpl(
                `${userId}-${rewardId}`, // Generate a simple ID
                userId,
                rewardId,
                false // Not unlocked yet
            );
            this.userRewards.push(userReward);
        }
        
        // Unlock the reward
        if (userReward instanceof UserRewardImpl) {
            userReward.unlock();
        } else {
            // If the userReward is not an instance of UserRewardImpl, update manually
            userReward.unlocked = true;
            userReward.unlockedAt = new Date();
            userReward.updatedAt = new Date();
        }
        
        return Promise.resolve(userReward);
    }

    getUnlockedRewardIds(userId: string): Promise<string[]> {
        const unlockedRewards = this.userRewards.filter(ur => ur.userId === userId && ur.unlocked);
        return Promise.resolve(unlockedRewards.map(ur => ur.rewardId));
    }

    getAll(): Promise<UserReward[]> {
        return Promise.resolve([...this.userRewards]);
    }

    getById(id: string): Promise<UserReward | null> {
        const userReward = this.userRewards.find(ur => ur.id === id);
        return Promise.resolve(userReward ?? null);
    }

    create(entity: UserReward): Promise<UserReward> {
        const exists = this.userRewards.find(ur => ur.id === entity.id);
        if (exists) {
            return Promise.reject(new Error(`UserReward with id ${entity.id} already exists.`));
        }
        this.userRewards.push(entity);
        return Promise.resolve(entity);
    }

    update(id: string, updates: Partial<UserReward>): Promise<UserReward> {
        const userReward = this.userRewards.find(ur => ur.id === id);
        if (!userReward) {
            return Promise.reject(new Error(`UserReward with id ${id} not found.`));
        }

        // Update allowed fields
        if (updates.unlocked !== undefined) {
            userReward.unlocked = updates.unlocked;
            if (updates.unlocked && !userReward.unlockedAt) {
                userReward.unlockedAt = new Date();
            }
        }
        
        userReward.updatedAt = new Date();
        return Promise.resolve(userReward);
    }

    delete(id: string): Promise<void> {
        const index = this.userRewards.findIndex(ur => ur.id === id);
        if (index === -1) {
            return Promise.reject(new Error(`UserReward with id ${id} not found.`));
        }
        this.userRewards.splice(index, 1);
        return Promise.resolve();
    }
}