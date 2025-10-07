export interface EventHandler {
  handle(user: { fullName: string }): Promise<void>;
}
