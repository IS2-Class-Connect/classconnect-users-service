/**
 * Defines a contract for repository operations on an entity of type `T`.
 */
export interface IRepository<T,R> {
  /**
   * Creates and returns a new entity.
   */
  create(data: T): Promise<T>;

  /**
   * Updates and returns the location of an existing entity.
   */
  setLocation(userUuid: string, latitude: number, longitude: number): Promise<T>;

  /**
   * Saves and returns an updated entity.
   */
  save(data: T): Promise<T>;

  /**
   * Finds and returns an entity by its ID.
   */
  findByUuid(userUuid: string): Promise<T | null>;

  /**
   * Finds and returns an entity by its email.
   */
  findByEmail(email: string): Promise<T | null>;

  /**
  * Retrieves all users.
  */
  findAll(): Promise<R[]> ;

  /**
   * Updates and returns the block status of an existing entity.
   */
  setBlockStatus(userUuid: string, blockStatus: boolean): Promise<T>;

}
