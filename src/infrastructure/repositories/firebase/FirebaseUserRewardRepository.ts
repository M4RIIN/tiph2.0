import { UserRewardRepository } from '@/domain/repositories/UserRewardRepository';
import { UserReward, UserRewardImpl } from '@/domain/entities/UserReward';
import { FirebaseRepository } from './FirebaseRepository';
import { db } from '@/infrastructure/firebase/config';
import { DocumentData, collection, getDocs, query, where } from 'firebase/firestore';

export class FirebaseUserRewardRepository extends FirebaseRepository<UserReward> implements UserRewardRepository {
  protected collectionName = 'userRewards';

  protected fromFirestore(data: DocumentData, id: string): UserReward {
    const userRewardData = this.convertTimestampsToDates(data) as Record<string, unknown>;

    return new UserRewardImpl(
      id,
      userRewardData.userId as string,
      userRewardData.rewardId as string,
      userRewardData.unlocked as boolean,
      userRewardData.unlockedAt as Date | undefined,
      userRewardData.createdAt as Date,
      userRewardData.updatedAt as Date
    );
  }

  protected toFirestore(entity: UserReward): DocumentData {
    return this.convertDatesToTimestamps({
      userId: entity.userId,
      rewardId: entity.rewardId,
      unlocked: entity.unlocked,
      unlockedAt: entity.unlockedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }

  async getUserRewardsByUserId(userId: string): Promise<UserReward[]> {
    const userRewardsRef = collection(db, this.collectionName);
    const q = query(userRewardsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => this.fromFirestore(doc.data(), doc.id));
  }

  async getUserRewardByUserIdAndRewardId(userId: string, rewardId: string): Promise<UserReward | null> {
    const userRewardsRef = collection(db, this.collectionName);
    const q = query(
      userRewardsRef,
      where('userId', '==', userId),
      where('rewardId', '==', rewardId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return this.fromFirestore(doc.data(), doc.id);
  }

  async unlockReward(userId: string, rewardId: string): Promise<UserReward> {
    // Check if the user reward already exists
    const userReward = await this.getUserRewardByUserIdAndRewardId(userId, rewardId);

    if (userReward) {
      // If it exists but is not unlocked, unlock it
      if (!userReward.unlocked) {
        userReward.unlock();
        return this.update(userReward.id, userReward);
      }
      return userReward;
    }

    // If it doesn't exist, create a new one
    const newUserReward = new UserRewardImpl(
      '', // ID will be assigned by Firestore
      userId,
      rewardId,
      true, // Unlocked
      new Date(), // Unlocked now
      new Date(),
      new Date()
    );

    return this.create(newUserReward);
  }

  async getUnlockedRewardIds(userId: string): Promise<string[]> {
    const userRewards = await this.getUserRewardsByUserId(userId);
    return userRewards
      .filter(ur => ur.unlocked)
      .map(ur => ur.rewardId);
  }
}
