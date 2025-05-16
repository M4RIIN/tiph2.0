import { Goal } from "@/domain/entities/Goal";
import { GoalRepository } from "@/domain/repositories/GoalRepository";

export class InMemoryGoalRepository implements GoalRepository {

    private goals: Goal[] = [];

    constructor() {}

    getGoalsByUserId(userId: string): Promise<Goal[]> {
        return this.filterGoals(goal => goal.userId === userId);
    }

    getCompletedGoalsByUserId(userId: string): Promise<Goal[]> {
        return this.filterGoals(goal => goal.userId === userId && goal.completed);
    }

    getIncompleteGoalsByUserId(userId: string): Promise<Goal[]> {
        return this.filterGoals(goal => goal.userId === userId && !goal.completed);
    }

    updateGoalProgress(goalId: string, pointsAdded: number): Promise<Goal> {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) {
            return Promise.reject(new Error(`Goal with id ${goalId} not found.`));
        }
        goal.addPoints(pointsAdded);
        return Promise.resolve(goal);
    }

    getAll(): Promise<Goal[]> {
        return Promise.resolve([...this.goals]);
    }

    getById(id: string): Promise<Goal | null> {
        const goal = this.goals.find(g => g.id === id);
        return Promise.resolve(goal ?? null);
    }

    create(entity: Goal): Promise<Goal> {
        const existing = this.goals.find(g => g.id === entity.id);
        if (existing) {
            return Promise.reject(new Error(`Goal with id ${entity.id} already exists.`));
        }
        this.goals.push(entity);
        return Promise.resolve(entity);
    }

    update(id: string, updates: Partial<Goal>): Promise<Goal> {
        const goal = this.goals.find(g => g.id === id);
        if (!goal) {
            return Promise.reject(new Error(`Goal with id ${id} not found.`));
        }

        // Mise à jour des champs autorisés
        Object.assign(goal, updates);
        goal.updatedAt = new Date();
        return Promise.resolve(goal);
    }

    delete(id: string): Promise<void> {
        const index = this.goals.findIndex(g => g.id === id);
        if (index === -1) {
            return Promise.reject(new Error(`Goal with id ${id} not found.`));
        }
        this.goals.splice(index, 1);
        return Promise.resolve();
    }

    private filterGoals(predicate: (goal: Goal) => boolean): Promise<Goal[]> {
        return Promise.resolve(this.goals.filter(predicate));
    }
}
