import { UserRepository } from '@/domain/repositories/UserRepository';
import { User } from '@/domain/entities/User';
import { FirebaseRepository } from './FirebaseRepository';
import { db } from '@/infrastructure/firebase/config';
import { DocumentData, collection, getDocs, query, where } from 'firebase/firestore';

export class FirebaseUserRepository extends FirebaseRepository<User> implements UserRepository {
  protected collectionName = 'users';

  protected fromFirestore(data: DocumentData, id: string): User {
    const userData = this.convertTimestampsToDates(data) as Record<string, unknown>;

    return new User(
      id,
      userData.name as string,
      userData.email as string,
      userData.points as number,
      userData.createdAt as Date,
      userData.updatedAt as Date
    );
  }

  protected toFirestore(entity: User): DocumentData {
    return this.convertDatesToTimestamps({
      name: entity.name,
      email: entity.email,
      points: entity.points,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const usersRef = collection(db, this.collectionName);
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return this.fromFirestore(doc.data(), doc.id);
  }

  async updateUserPoints(userId: string, points: number): Promise<User> {
    const user = await this.getById(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const updatedUser = { ...user, points, updatedAt: new Date() };
    return this.update(userId, updatedUser);
  }
}
