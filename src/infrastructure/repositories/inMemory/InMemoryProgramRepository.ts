import { Program, ProgramExercise } from "@/domain/entities/Program";
import { ProgramRepository } from "@/domain/repositories/ProgramRepository";

export class InMemoryProgramRepository implements ProgramRepository {
    private programs: Program[] = [];

    getProgramsByUserId(userId: string): Promise<Program[]> {
        return Promise.resolve(this.programs.filter(p => p.userId === userId));
    }

    addExerciseToProgram(programId: string, exercise: ProgramExercise): Promise<Program> {
        const program = this.programs.find(p => p.id === programId);
        if (!program) {
            return Promise.reject(new Error(`Program with id ${programId} not found.`));
        }
        program.addExercise(exercise);
        return Promise.resolve(program);
    }

    removeExerciseFromProgram(programId: string, exerciseName: string): Promise<Program> {
        const program = this.programs.find(p => p.id === programId);
        if (!program) {
            return Promise.reject(new Error(`Program with id ${programId} not found.`));
        }
        program.removeExercise(exerciseName);

        return Promise.resolve(program);
    }

    save(program: Program): Promise<Program> {
        const index = this.programs.findIndex(p => p.id === program.id);
        if (index !== -1) {
            this.programs[index] = program;
        } else {
            this.programs.push(program);
        }
        return Promise.resolve(program);
    }

    getAll(): Promise<Program[]> {
        return Promise.resolve([...this.programs]);
    }

    getById(id: string): Promise<Program | null> {
        const program = this.programs.find(p => p.id === id);
        return Promise.resolve(program ?? null);
    }

    create(entity: Program): Promise<Program> {
        const exists = this.programs.find(p => p.id === entity.id);
        if (exists) {
            return Promise.reject(new Error(`Program with id ${entity.id} already exists.`));
        }
        this.programs.push(entity);
        return Promise.resolve(entity);
    }

    update(id: string, updates: Partial<Program>): Promise<Program> {
        const program = this.programs.find(p => p.id === id);
        if (!program) {
            return Promise.reject(new Error(`Program with id ${id} not found.`));
        }

        const { name, type, description, exercises } = updates;
        program.updateDetails(name, type, description);

        // Update exercises if provided
        if (exercises) {
            program.exercises = exercises;
            program.updatedAt = new Date();
        }

        return Promise.resolve(program);
    }

    delete(id: string): Promise<void> {
        const index = this.programs.findIndex(p => p.id === id);
        if (index === -1) {
            return Promise.reject(new Error(`Program with id ${id} not found.`));
        }
        this.programs.splice(index, 1);
        return Promise.resolve();
    }
}
