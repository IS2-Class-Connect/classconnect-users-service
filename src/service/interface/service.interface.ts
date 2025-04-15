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
  setLocation(useriUuid: string, latitude: number, longitude: number): Promise<T>;

  /**
   * Handles increasing and returning the failed login attempts of an entity.
   */
  increaseFailedAttempts(useriUuid: string): Promise<T>;

  /**
   * Checks if the entity is blocked.
   */
  isAccountLocked(useriUuid: string): Promise<boolean>;
}
