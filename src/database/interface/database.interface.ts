/**
 * Defines a contract for repository operations on an entity of type `T`.
 */
export interface IRepository<T> {
  /**
   * Creates and returns a new entity.
   */
  create(data: T): Promise<T>;

  /**
   * Updates and returns the location of an existing entity.
   */
  setLocation(useriUuid: string, latitude: number, longitude: number): Promise<T>;

  /**
   * Saves and returns an updated entity.
   */
  save(data: T): Promise<T>;

  /**
   * Finds and returns an entity by its ID.
   */
  findByUuid(useriUuid: string): Promise<T | null>;

  /**
   * Finds and returns an entity by its email.
   */
  findByEmail(email: string): Promise<T | null>;

  /**
   * Checks whether the account of an entity is locked.
   */
  getAccountLockStatus(email: string): Promise<boolean>;
}
