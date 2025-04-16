/**
 * Defines a contract for service operations on an entity of type `T`.
 */
export interface IService<T> {
  /**
   * Handles creating and returning a new entity.
   */
  create(data: T): Promise<T>;

  /**
   * Handles retrieving and returning an entity by its ID.
   */
  findById(id: number): Promise<T | null>;

  /**
   * Handles updating and returning the location of an existing entity.
   */
  setLocation(id: number, latitude: number, longitude: number): Promise<T>;

  /**
   * Handles increasing and returning the failed login attempts of an entity.
   */
  increaseFailedAttempts(id: number): Promise<T>;

  /**
   * Checks if the entity is blocked.
   */
  isAccountLocked(id: number): Promise<boolean>;
  
  /**
   * Handles updating and returning the email of an existing entity.
   */
  setEmail(id: number, newEmail: string): Promise<T>;

  /**
   * Handles updating and returning the name of an existing entity.
   */
  setName(id: number, newName: string): Promise<T>;
}
