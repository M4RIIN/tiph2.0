import { WorkoutSession } from "@/domain/entities/WorkoutSession";
import { WorkoutSessionRepository } from "@/domain/repositories/WorkoutSessionRepository";

export class InMemoryWorkoutSessionRepository implements WorkoutSessionRepository {
    private sessions: WorkoutSession[] = [];

    getSessionsByUserId(userId: string): Promise<WorkoutSession[]> {
        return Promise.resolve(this.sessions.filter(s => s.userId === userId));
    }

    getSessionsByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkoutSession[]> {
        return Promise.resolve(
            this.sessions.filter(s =>
                s.userId === userId &&
                s.date >= startDate &&
                s.date <= endDate
            )
        );
    }

    getSessionsByProgramId(programId: string): Promise<WorkoutSession[]> {
        return Promise.resolve(
            this.sessions.filter(s => s.programId === programId)
        );
    }

    getAll(): Promise<WorkoutSession[]> {
        return Promise.resolve([...this.sessions]);
    }

    getById(id: string): Promise<WorkoutSession | null> {
        const session = this.sessions.find(s => s.id === id);
        return Promise.resolve(session ?? null);
    }

    create(entity: WorkoutSession): Promise<WorkoutSession> {
        const exists = this.sessions.find(s => s.id === entity.id);
        if (exists) {
            return Promise.reject(new Error(`Session with id ${entity.id} already exists.`));
        }
        this.sessions.push(entity);
        return Promise.resolve(entity);
    }

    update(id: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
        const session = this.sessions.find(s => s.id === id);
        if (!session) {
            return Promise.reject(new Error(`Session with id ${id} not found.`));
        }

        const { type, date, duration, programId, notes } = updates;
        session.updateDetails(type, date, duration, programId, notes);


        return Promise.resolve(session);
    }

    delete(id: string): Promise<void> {
        const index = this.sessions.findIndex(s => s.id === id);
        if (index === -1) {
            return Promise.reject(new Error(`Session with id ${id} not found.`));
        }
        this.sessions.splice(index, 1);
        return Promise.resolve();
    }
}
