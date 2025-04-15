/**
 * Defines a contract for controller operations on an entity of type `T`.
 */
export interface IController<T> {
  /**
   * Handles creating and returning a new entity.
   */
  create(data: T): Promise<T>;
  /**
   * Handles retrieving and returning an entity by its ID.
   */
  getById(id: string): Promise<T>;

  /**
   * Handles updating and returning the location of an existing entity.
   */
  updateLocation(id: string, latitude: number, longitude: number): Promise<T>;
  /**
   * Handles updating and returning the email of an existing entity.
   */
  updateEmail(id: string, newEmail: string): Promise<T>;

  /**
   * Handles increasing and returning the failed login attempts of an entity.
   */
  increaseFailedAttempts(id: string): Promise<T>;

  /**
   * Checks whether the account of an entity is locked.
   */
  checkLockStatus(id: string): Promise<{ message: string }>;
}
