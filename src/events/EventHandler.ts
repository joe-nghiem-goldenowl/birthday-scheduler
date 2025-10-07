export interface EventHandler {
  handle(user: { userId: number, fullName: string, birthday: string, location: string }): Promise<void>;
}
