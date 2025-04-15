/**
 * Defines a contract for service operations on an entity of type `T`.
 */
export interface IService<T> {
  /**
   * Handles creating and returning a new entity.
   */
  create(data: T): Promise<T>;

  /**
   * Handles updating and returning the location of an existing entity.
   */
  setLocation(userid: string, latitude: number, longitude: number): Promise<T>;

  /**
   * Handles increasing and returning the failed login attempts of an entity.
   */
  increaseFailedAttempts(userid: string): Promise<T>;

  /**
   * Checks if the entity is blocked.
   */
  isAccountLocked(userid: string): Promise<boolean>;
}
