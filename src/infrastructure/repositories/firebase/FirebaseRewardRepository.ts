import { RewardRepository } from '@/domain/repositories/RewardRepository';
import { Reward, RewardTier, PREDEFINED_REWARDS } from '@/domain/entities/Reward';
import { FirebaseRepository } from './FirebaseRepository';
import { db } from '@/infrastructure/firebase/config';
import { DocumentData, collection, getDocs, query, where } from 'firebase/firestore';

export class FirebaseRewardRepository extends FirebaseRepository<Reward> implements RewardRepository {
  protected collectionName = 'rewards';

  protected fromFirestore(data: DocumentData, id: string): Reward {
    const rewardData = this.convertTimestampsToDates(data) as Record<string, unknown>;

    return new Reward(
      id,
      rewardData.name as string,
      rewardData.description as string,
      rewardData.tier as RewardTier,
      rewardData.pointsCost as number,
      rewardData.imageUrl as string,
      rewardData.createdAt as Date,
      rewardData.updatedAt as Date
    );
  }

  protected toFirestore(entity: Reward): DocumentData {
    return this.convertDatesToTimestamps({
      name: entity.name,
      description: entity.description,
      tier: entity.tier,
      pointsCost: entity.pointsCost,
      imageUrl: entity.imageUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }

  async getRewardsByTier(tier: RewardTier): Promise<Reward[]> {
    const rewardsRef = collection(db, this.collectionName);
    const q = query(rewardsRef, where('tier', '==', tier));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => this.fromFirestore(doc.data(), doc.id));
  }

  async getRewardsByPointsCost(minPoints: number, maxPoints?: number): Promise<Reward[]> {
    const rewardsRef = collection(db, this.collectionName);
    let q;

    if (maxPoints !== undefined) {
      q = query(
        rewardsRef,
        where('pointsCost', '>=', minPoints),
        where('pointsCost', '<=', maxPoints)
      );
    } else {
      q = query(rewardsRef, where('pointsCost', '>=', minPoints));
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => this.fromFirestore(doc.data(), doc.id));
  }

  async getPredefinedRewards(): Promise<Reward[]> {
    // In a real implementation, we might fetch these from Firestore
    // But for now, we'll just return the predefined rewards
    return PREDEFINED_REWARDS;
  }
}
