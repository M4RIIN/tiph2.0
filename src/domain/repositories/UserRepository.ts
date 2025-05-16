import { Repository } from './Repository';
import { User } from '../entities/User';

export interface UserRepository extends Repository<User> {
  getUserByEmail(email: string): Promise<User | null>;
  updateUserPoints(userId: string, points: number): Promise<User>;
}