export type WorkoutType = 'crossfit' | 'pilates' | 'gym' | 'running' | 'swimming' | 'yoga' | 'other';

export interface WorkoutSession {
  id: string;
  userId: string;
  type: WorkoutType;
  date: Date;
  duration: number; // in minutes
  programId?: string; // optional, if the session is part of a program
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  updateDetails(
      type?: WorkoutType,
      date?: Date,
      duration?: number,
      programId?: string,
      notes?: string
  ): void;
}

export class WorkoutSessionImpl implements WorkoutSession {
  constructor(
    public id: string,
    public userId: string,
    public type: WorkoutType,
    public date: Date,
    public duration: number,
    public programId?: string,
    public notes?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  updateDetails(
    type?: WorkoutType,
    date?: Date,
    duration?: number,
    programId?: string,
    notes?: string
  ): void {
    if (type) this.type = type;
    if (date) this.date = date;
    if (duration) this.duration = duration;
    if (programId !== undefined) this.programId = programId;
    if (notes !== undefined) this.notes = notes;
    this.updatedAt = new Date();
  }

  // Helper method to check if this session is in a specific week
  isInWeek(weekStartDate: Date): boolean {
    const sessionDate = new Date(this.date);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    
    return sessionDate >= weekStartDate && sessionDate <= weekEndDate;
  }
}