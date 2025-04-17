/**
 * Defines a contract for controller operations on an entity of type `T`.
 */
export interface IController<T> {
  /**
   * Handles creating and returning a new entity.
   */
  create(data: T): Promise<T>;

  /**
   * Handles updating and returning the email of an existing entity.
   */
  updateEmail(useriUuid: string, newEmail: string): Promise<T>;

  /**
   * Handles updating and returning the name of an existing entity.
   */
  updateName(useriUuid: string, newName: string): Promise<T>;
  
    /**
   * Handles updating and returning the location of an existing entity.
   */
  updateLocation(useriUuid: string, latitude: number, longitude: number): Promise<T>;

  /**
   * Handles increasing and returning the failed login attempts of an entity.
   */
  increaseFailedAttempts(email: string): Promise<T>;

  /**
   * Checks whether the account of an entity is locked.
   */
  checkLockStatus(email: string): Promise<{ message: string }>;

  /**
   * Handles returning an user information.
   */
  findByUuid(userUuid: string): Promise<T>;
  
}
