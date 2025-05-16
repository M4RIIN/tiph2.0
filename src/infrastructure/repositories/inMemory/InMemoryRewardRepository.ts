import { Reward, RewardTier, PREDEFINED_REWARDS } from "@/domain/entities/Reward";
import { RewardRepository } from "@/domain/repositories/RewardRepository";

export class InMemoryRewardRepository implements RewardRepository {
    private rewards: Reward[] = [...PREDEFINED_REWARDS];

    getRewardsByTier(tier: RewardTier): Promise<Reward[]> {
        return Promise.resolve(this.rewards.filter(r => r.tier === tier));
    }

    getRewardsByPointsCost(minPoints: number, maxPoints?: number): Promise<Reward[]> {
        return Promise.resolve(
            this.rewards.filter(r => 
                r.pointsCost >= minPoints && 
                (maxPoints === undefined || r.pointsCost <= maxPoints)
            )
        );
    }

    getPredefinedRewards(): Promise<Reward[]> {
        return Promise.resolve([...PREDEFINED_REWARDS]);
    }

    getAll(): Promise<Reward[]> {
        return Promise.resolve([...this.rewards]);
    }

    getById(id: string): Promise<Reward | null> {
        const reward = this.rewards.find(r => r.id === id);
        return Promise.resolve(reward ?? null);
    }

    create(entity: Reward): Promise<Reward> {
        const exists = this.rewards.find(r => r.id === entity.id);
        if (exists) {
            return Promise.reject(new Error(`Reward with id ${entity.id} already exists.`));
        }
        this.rewards.push(entity);
        return Promise.resolve(entity);
    }

    update(id: string, updates: Partial<Reward>): Promise<Reward> {
        const reward = this.rewards.find(r => r.id === id);
        if (!reward) {
            return Promise.reject(new Error(`Reward with id ${id} not found.`));
        }

        const { name, description, tier, pointsCost, imageUrl } = updates;
        
        if (reward.updateDetails) {
            reward.updateDetails(name, description, tier, pointsCost, imageUrl);
        } else {
            // If the reward doesn't have an updateDetails method, update manually
            if (name !== undefined) reward.name = name;
            if (description !== undefined) reward.description = description;
            if (tier !== undefined) reward.tier = tier;
            if (pointsCost !== undefined) reward.pointsCost = pointsCost;
            if (imageUrl !== undefined) reward.imageUrl = imageUrl;
            reward.updatedAt = new Date();
        }

        return Promise.resolve(reward);
    }

    delete(id: string): Promise<void> {
        const index = this.rewards.findIndex(r => r.id === id);
        if (index === -1) {
            return Promise.reject(new Error(`Reward with id ${id} not found.`));
        }
        this.rewards.splice(index, 1);
        return Promise.resolve();
    }
}