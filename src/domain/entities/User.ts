

export class User{
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public points: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  addPoints(points: number): void {
    this.points += points;
    this.updatedAt = new Date();
  }

  usePoints(points: number): boolean {
    if (this.points >= points) {
      this.points -= points;
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }
}