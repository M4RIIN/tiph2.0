import { User } from "@/domain/entities/User";
import { UserRepository } from "@/domain/repositories/UserRepository";

export class InMemoryUserRepository implements UserRepository {
    private users: User[] = [new User(
        "user1",
        "Tiphaine",
        "Tiphaine",
        0,
        new Date(),
        new Date()
    )];

    getUserByEmail(email: string): Promise<User | null> {
        const user = this.users.find(u => u.email === email);
        return Promise.resolve(user ?? null);
    }

    updateUserPoints(userId: string, points: number): Promise<User> {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            return Promise.reject(new Error(`User with id ${userId} not found.`));
        }

        user.addPoints(points);

        
        return Promise.resolve(user);
    }

    getAll(): Promise<User[]> {
        return Promise.resolve([...this.users]);
    }

    getById(id: string): Promise<User | null> {
        const user = this.users.find(u => u.id === id);
        return Promise.resolve(user ?? null);
    }

    create(entity: User): Promise<User> {
        const exists = this.users.find(u => u.id === entity.id);
        if (exists) {
            return this.update(entity.id, entity);
        }
        this.users.push(entity);
        return Promise.resolve(entity);
    }

    update(id: string, updates: Partial<User>): Promise<User> {
        const user = this.users.find(u => u.id === id);
        if (!user) {
            return Promise.reject(new Error(`User with id ${id} not found.`));
        }

        // Update allowed fields
        if (updates.name !== undefined) user.name = updates.name;
        if (updates.email !== undefined) user.email = updates.email;
        if (updates.points !== undefined) user.points = updates.points;
        
        user.updatedAt = new Date();
        return Promise.resolve(user);
    }

    delete(id: string): Promise<void> {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) {
            return Promise.reject(new Error(`User with id ${id} not found.`));
        }
        this.users.splice(index, 1);
        return Promise.resolve();
    }
}