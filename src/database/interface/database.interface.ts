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
  setLocation(id: number, latitude: number, longitude: number): Promise<T>;
  
  /**
   * Updates and returns the email of an existing entity.
   */
  setEmail(id: number, newEmail: string): Promise<T>;

  /**
   * Updates and returns the name of an existing entity.
   */
  setName(id: number, newName: string): Promise<T>;

  /**
   * Saves and returns an updated entity.
   */
  save(data: T): Promise<T>;

  /**
   * Finds and returns an entity by its ID.
   */
  findById(id: number): Promise<T | null>;

  /**
   * Checks whether the account of an entity is locked.
   */
  isAccountLocked(id: number): Promise<boolean>;
}
