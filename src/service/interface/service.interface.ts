import { UpdateUserProfileDto } from '../../models/user.update.data';

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
  * Handles updating an existing entity.
  */
   updateProfileInfo(uuid: string, updates: UpdateUserProfileDto): Promise<T>;
  
  /**
  * Handles increasing and returning the failed login attempts of an entity.
  */
  increaseFailedAttempts(email: string): Promise<T>;

  /**
  * Checks if the entity is blocked.
  */
  getAccountLockStatus(email: string): Promise<{ accountLocked: boolean, lockUntil: Date | null }>;

  /**
  * Handles returning an entity by its ID.
  */
  findByUuid(useriUuid: string): Promise<T | null>;

  /**
  * Handles Retrieving all users.
  */
  getAllUsers(): Promise<T[]>;
}
