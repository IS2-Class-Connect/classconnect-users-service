/**
 * Defines a contract for controller operations on an entity of type `T`.
 */
export interface IController<T> {
  /**
   * Handles creating and returning a new entity.
   */
  create(data: T): Promise<T>;

  /**
   * Handles updating and returning the location of an existing entity.
   */
  updateLocation(userid: string, latitude: number, longitude: number): Promise<T>;

  /**
   * Handles increasing and returning the failed login attempts of an entity.
   */
  increaseFailedAttempts(userid: string): Promise<T>;

  /**
   * Checks whether the account of an entity is locked.
   */
  checkLockStatus(userid: string): Promise<{ message: string }>;
}
