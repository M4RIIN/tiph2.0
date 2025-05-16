import { GoalRepository } from '@/domain/repositories/GoalRepository';
import { Goal, GoalImpl } from '@/domain/entities/Goal';
import { FirebaseRepository } from './FirebaseRepository';
import { db } from '@/infrastructure/firebase/config';
import { DocumentData, collection, getDocs, query, where } from 'firebase/firestore';

export class FirebaseGoalRepository extends FirebaseRepository<Goal> implements GoalRepository {
  protected collectionName = 'goals';

  protected fromFirestore(data: DocumentData, id: string): Goal {
    const goalData = this.convertTimestampsToDates(data) as Record<string, unknown>;

    return new GoalImpl(
      id,
      goalData.userId as string,
      goalData.name as string,
      goalData.pointsRequired as number,
      goalData.pointsAccumulated as number,
      goalData.completed as boolean,
      goalData.description as string | undefined,
      goalData.rewardId as string | undefined,
      goalData.createdAt as Date,
      goalData.updatedAt as Date
    );
  }

  protected toFirestore(entity: Goal): DocumentData {
    return this.convertDatesToTimestamps({
      userId: entity.userId,
      name: entity.name,
      pointsRequired: entity.pointsRequired,
      pointsAccumulated: entity.pointsAccumulated,
      completed: entity.completed,
      description: entity.description,
      rewardId: entity.rewardId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }

  async getGoalsByUserId(userId: string): Promise<Goal[]> {
    const goalsRef = collection(db, this.collectionName);
    const q = query(goalsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => this.fromFirestore(doc.data(), doc.id));
  }

  async getCompletedGoalsByUserId(userId: string): Promise<Goal[]> {
    const goalsRef = collection(db, this.collectionName);
    const q = query(
      goalsRef,
      where('userId', '==', userId),
      where('completed', '==', true)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => this.fromFirestore(doc.data(), doc.id));
  }

  async getIncompleteGoalsByUserId(userId: string): Promise<Goal[]> {
    const goalsRef = collection(db, this.collectionName);
    const q = query(
      goalsRef,
      where('userId', '==', userId),
      where('completed', '==', false)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => this.fromFirestore(doc.data(), doc.id));
  }

  async updateGoalProgress(goalId: string, pointsAdded: number): Promise<Goal> {
    const goal = await this.getById(goalId);

    if (!goal) {
      throw new Error(`Goal with ID ${goalId} not found`);
    }

    goal.addPoints(pointsAdded);

    return this.update(goalId, {
      pointsAccumulated: goal.pointsAccumulated,
      completed: goal.completed,
      updatedAt: new Date()
    });
  }
}
