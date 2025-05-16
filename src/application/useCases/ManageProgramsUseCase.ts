import { Program, ProgramImpl, ProgramExercise } from '../../domain/entities/Program';
import {WorkoutType} from "@/domain/entities/WorkoutSession";

export interface CreateProgramDto {
  userId: string;
  name: string;
  type: WorkoutType;
  description?: string;
  exercises?: ProgramExercise[];
}

export interface UpdateProgramDto {
  name?: string;
  type?: WorkoutType;
  description?: string;
  exercises?: ProgramExercise[];
}

export interface AddExerciseDto {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  notes?: string;
}

export interface UpdateExerciseDto {
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  notes?: string;
}

export interface ManageProgramsUseCase {
  createProgram(dto: CreateProgramDto): Promise<Program>;
  updateProgram(id: string, dto: UpdateProgramDto): Promise<Program>;
  getProgramById(id: string): Promise<Program>;
  getProgramsByUserId(userId: string): Promise<Program[]>;
  getProgramsByType(userId: string, type: WorkoutType): Promise<Program[]>;
  deleteProgram(id: string): Promise<void>;
  addExerciseToProgram(programId: string, exercise: AddExerciseDto): Promise<Program>;
  updateExerciseInProgram(programId: string, exerciseName: string, exercise: UpdateExerciseDto): Promise<Program>;
  removeExerciseFromProgram(programId: string, exerciseName: string): Promise<Program>;
}

export class ManageProgramsUseCaseImpl implements ManageProgramsUseCase {
  constructor(
    private readonly programRepository: {
      findById: (id: string) => Promise<Program | null>;
      findByUserId: (userId: string) => Promise<Program[]>;
      findByUserIdAndType: (userId: string, type: WorkoutType) => Promise<Program[]>;
      save: (program: Program) => Promise<Program>;
      delete: (id: string) => Promise<void>;
    },
    private readonly idGenerator: {
      generate: () => string;
    }
  ) {}

  /**
   * Create a new program
   */
  async createProgram(dto: CreateProgramDto): Promise<Program> {
    // Create new program
    const program = new ProgramImpl(
      this.idGenerator.generate(),
      dto.userId,
      dto.name,
      dto.type,
      dto.exercises || [],
      dto.description
    );

    // Save and return the program
    return this.programRepository.save(program);
  }

  /**
   * Update an existing program
   */
  async updateProgram(id: string, dto: UpdateProgramDto): Promise<Program> {
    // Find the program
    const program = await this.programRepository.findById(id);
    if (!program) {
      throw new Error(`Program with ID ${id} not found`);
    }

    // Update program details
    if (program instanceof ProgramImpl) {
      program.updateDetails(
        dto.name,
        dto.type,
        dto.description
      );
    } else {
      // If it's not an instance of ProgramImpl, update properties manually
      if (dto.name) program.name = dto.name;
      if (dto.type) program.type = dto.type;
      if (dto.description !== undefined) program.description = dto.description;
      program.updatedAt = new Date();
    }

    // Update exercises if provided
    if (dto.exercises) {
      program.exercises = dto.exercises;
      program.updatedAt = new Date();
    }

    // Save and return the updated program
    return this.programRepository.save(program);
  }

  /**
   * Get a program by ID
   */
  async getProgramById(id: string): Promise<Program> {
    const program = await this.programRepository.findById(id);
    if (!program) {
      throw new Error(`Program with ID ${id} not found`);
    }
    return program;
  }

  /**
   * Get all programs for a user
   */
  async getProgramsByUserId(userId: string): Promise<Program[]> {
    return this.programRepository.findByUserId(userId);
  }

  /**
   * Get programs for a user by workout type
   */
  async getProgramsByType(userId: string, type: WorkoutType): Promise<Program[]> {
    return this.programRepository.findByUserIdAndType(userId, type);
  }

  /**
   * Delete a program
   */
  async deleteProgram(id: string): Promise<void> {
    // Check if program exists
    const program = await this.programRepository.findById(id);
    if (!program) {
      throw new Error(`Program with ID ${id} not found`);
    }

    // Delete the program
    await this.programRepository.delete(id);
  }

  /**
   * Add an exercise to a program
   */
  async addExerciseToProgram(programId: string, exercise: AddExerciseDto): Promise<Program> {
    // Find the program
    const program = await this.programRepository.findById(programId);
    if (!program) {
      throw new Error(`Program with ID ${programId} not found`);
    }

    // Create the exercise object
    const programExercise: ProgramExercise = {
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      duration: exercise.duration,
      notes: exercise.notes
    };

    // Add the exercise to the program
    if (program instanceof ProgramImpl) {
      program.addExercise(programExercise);
    } else {
      // If it's not an instance of ProgramImpl, update properties manually
      program.exercises.push(programExercise);
      program.updatedAt = new Date();
    }

    // Save and return the updated program
    return this.programRepository.save(program);
  }

  /**
   * Update an exercise in a program
   */
  async updateExerciseInProgram(programId: string, exerciseName: string, exercise: UpdateExerciseDto): Promise<Program> {
    // Find the program
    const program = await this.programRepository.findById(programId);
    if (!program) {
      throw new Error(`Program with ID ${programId} not found`);
    }

    // Find the exercise
    const exerciseIndex = program.exercises.findIndex(e => e.name === exerciseName);
    if (exerciseIndex === -1) {
      throw new Error(`Exercise with name ${exerciseName} not found in program`);
    }

    // Update the exercise
    if (program instanceof ProgramImpl) {
      const updatedExercise: Partial<ProgramExercise> = {
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        duration: exercise.duration,
        notes: exercise.notes
      };
      program.updateExercise(exerciseName, updatedExercise);
    } else {
      // If it's not an instance of ProgramImpl, update properties manually
      const currentExercise = program.exercises[exerciseIndex];
      program.exercises[exerciseIndex] = {
        ...currentExercise,
        sets: exercise.sets !== undefined ? exercise.sets : currentExercise.sets,
        reps: exercise.reps !== undefined ? exercise.reps : currentExercise.reps,
        weight: exercise.weight !== undefined ? exercise.weight : currentExercise.weight,
        duration: exercise.duration !== undefined ? exercise.duration : currentExercise.duration,
        notes: exercise.notes !== undefined ? exercise.notes : currentExercise.notes
      };
      program.updatedAt = new Date();
    }

    // Save and return the updated program
    return this.programRepository.save(program);
  }

  /**
   * Remove an exercise from a program
   */
  async removeExerciseFromProgram(programId: string, exerciseName: string): Promise<Program> {
    // Find the program
    const program = await this.programRepository.findById(programId);
    if (!program) {
      throw new Error(`Program with ID ${programId} not found`);
    }

    // Remove the exercise
    if (program instanceof ProgramImpl) {
      program.removeExercise(exerciseName);
    } else {
      // If it's not an instance of ProgramImpl, update properties manually
      program.exercises = program.exercises.filter(e => e.name !== exerciseName);
      program.updatedAt = new Date();
    }

    // Save and return the updated program
    return this.programRepository.save(program);
  }
}
