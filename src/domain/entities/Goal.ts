export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  pointsRequired: number;
  pointsAccumulated: number;
  completed: boolean;
  rewardId?: string; // Optional link to a reward
  createdAt: Date;
  updatedAt: Date;

  addPoints(points: number): void;
  reset(): void;
  updateDetails(
      name?: string,
      pointsRequired?: number,
      description?: string,
      rewardId?: string
  ): void;
  isCompleted(): boolean;
}

export class GoalImpl implements Goal {
  constructor(
    public id: string,
    public userId: string,
    public name: string,
    public pointsRequired: number,
    public pointsAccumulated: number = 0,
    public completed: boolean = false,
    public description?: string,
    public rewardId?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Add points to the goal
  addPoints(points: number): void {
    this.pointsAccumulated += points;
    
    // Check if goal is completed
    if (this.pointsAccumulated >= this.pointsRequired && !this.completed) {
      this.completed = true;
    }
    
    this.updatedAt = new Date();
  }

  // Reset the goal
  reset(): void {
    this.pointsAccumulated = 0;
    this.completed = false;
    this.updatedAt = new Date();
  }

  // Update goal details
  updateDetails(
    name?: string,
    pointsRequired?: number,
    description?: string,
    rewardId?: string
  ): void {
    if (name) this.name = name;
    if (pointsRequired) this.pointsRequired = pointsRequired;
    if (description !== undefined) this.description = description;
    if (rewardId !== undefined) this.rewardId = rewardId;
    this.updatedAt = new Date();
  }

  // Check if goal is completed
  isCompleted(): boolean {
    return this.completed;
  }
}