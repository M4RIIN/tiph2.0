import { WorkoutSession, WorkoutSessionImpl, WorkoutType } from '../../domain/entities/WorkoutSession';
import {WorkoutSessionRepository} from "@/domain/repositories/WorkoutSessionRepository";
import {ProgramRepository} from "@/domain/repositories/ProgramRepository";

export interface CreateWorkoutSessionDto {
  userId: string;
  type: WorkoutType;
  date: Date;
  duration: number;
  programId?: string;
  notes?: string;
}

export interface UpdateWorkoutSessionDto {
  type?: WorkoutType;
  date?: Date;
  duration?: number;
  programId?: string;
  notes?: string;
}

export interface ManageWorkoutSessionsUseCase {
  createWorkoutSession(dto: CreateWorkoutSessionDto): Promise<WorkoutSession>;
  updateWorkoutSession(id: string, dto: UpdateWorkoutSessionDto): Promise<WorkoutSession>;
  getWorkoutSessionById(id: string): Promise<WorkoutSession>;
  getWorkoutSessionsByUserId(userId: string): Promise<WorkoutSession[]>;
  getWorkoutSessionsByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkoutSession[]>;
  deleteWorkoutSession(id: string): Promise<void>;
  applyProgramToWorkoutSession(workoutSessionId: string, programId: string): Promise<WorkoutSession>;
}

export class ManageWorkoutSessionsUseCaseImpl implements ManageWorkoutSessionsUseCase {
  constructor(
    private readonly workoutSessionRepository: WorkoutSessionRepository,
    private readonly programRepository: ProgramRepository,
    private readonly idGenerator: {
      generate: () => string;
    }
  ) {}

  /**
   * Create a new workout session
   */
  async createWorkoutSession(dto: CreateWorkoutSessionDto): Promise<WorkoutSession> {
    // Validate program if provided
    if (dto.programId !== undefined) {
      const program = await this.programRepository.getById(dto.programId);
      if (!program) {
        throw new Error(`Program with ID ${dto.programId} not found`);
      }
    }

    // Create new workout session
    const workoutSession = new WorkoutSessionImpl(
      this.idGenerator.generate(),
      dto.userId,
      dto.type,
      dto.date,
      dto.duration,
      dto.programId,
      dto.notes
    );

    // Save and return the workout session
    return this.workoutSessionRepository.create(workoutSession);
  }

  /**
   * Update an existing workout session
   */
  async updateWorkoutSession(id: string, dto: UpdateWorkoutSessionDto): Promise<WorkoutSession> {
    // Find the workout session
    const workoutSession = await this.workoutSessionRepository.getById(id);
    if (!workoutSession) {
      throw new Error(`Workout session with ID ${id} not found`);
    }

    // Validate program if provided
    if (dto.programId) {
      const program = await this.programRepository.getById(dto.programId);
      if (!program) {
        throw new Error(`Program with ID ${dto.programId} not found`);
      }
    }

    // Update workout session details
    if (workoutSession instanceof WorkoutSessionImpl) {
      workoutSession.updateDetails(
        dto.type,
        dto.date,
        dto.duration,
        dto.programId,
        dto.notes
      );
    } else {
      // If it's not an instance of WorkoutSessionImpl, update properties manually
      if (dto.type) workoutSession.type = dto.type;
      if (dto.date) workoutSession.date = dto.date;
      if (dto.duration) workoutSession.duration = dto.duration;
      if (dto.programId !== undefined) workoutSession.programId = dto.programId;
      if (dto.notes !== undefined) workoutSession.notes = dto.notes;
      workoutSession.updatedAt = new Date();
    }

    // Save and return the updated workout session
    return this.workoutSessionRepository.create(workoutSession);
  }

  /**
   * Get a workout session by ID
   */
  async getWorkoutSessionById(id: string): Promise<WorkoutSession> {
    const workoutSession = await this.workoutSessionRepository.getById(id);
    if (!workoutSession) {
      throw new Error(`Workout session with ID ${id} not found`);
    }
    return workoutSession;
  }

  /**
   * Get all workout sessions for a user
   */
  async getWorkoutSessionsByUserId(userId: string): Promise<WorkoutSession[]> {
    return this.workoutSessionRepository.getSessionsByUserId(userId);
  }

  /**
   * Get workout sessions for a user within a date range
   */
  async getWorkoutSessionsByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkoutSession[]> {
    return this.workoutSessionRepository.getSessionsByUserIdAndDateRange(userId, startDate, endDate);
  }

  /**
   * Delete a workout session
   */
  async deleteWorkoutSession(id: string): Promise<void> {
    // Check if workout session exists
    const workoutSession = await this.workoutSessionRepository.getById(id);
    if (!workoutSession) {
      throw new Error(`Workout session with ID ${id} not found`);
    }

    // Delete the workout session
    await this.workoutSessionRepository.delete(id);
  }

  /**
   * Apply a program to a workout session
   */
  async applyProgramToWorkoutSession(workoutSessionId: string, programId: string): Promise<WorkoutSession> {
    // Find the workout session
    const workoutSession = await this.workoutSessionRepository.getById(workoutSessionId);
    if (!workoutSession) {
      throw new Error(`Workout session with ID ${workoutSessionId} not found`);
    }

    // Find the program
    const program = await this.programRepository.getById(programId);
    if (!program) {
      throw new Error(`Program with ID ${programId} not found`);
    }

    // Update the workout session with the program ID
    if (workoutSession instanceof WorkoutSessionImpl) {
      workoutSession.updateDetails(
        undefined,
        undefined,
        undefined,
        programId
      );
    } else {
      workoutSession.programId = programId;
      workoutSession.updatedAt = new Date();
    }

    // Save and return the updated workout session
    return this.workoutSessionRepository.create(workoutSession);
  }
}
