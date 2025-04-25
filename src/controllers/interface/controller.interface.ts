import { UpdateUserProfileDto } from '../../models/user.update.data';

/**
 * Defines a contract for controller operations on an entity of type `T`.
 */
export interface IController<T,R> {
  /**
   * Handles creating and returning a new entity.
   */
  create(data: T): Promise<T>;

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
  checkLockStatus(email: string): Promise<{ message: string, isLocked: number, lockedDate: Date|null  }>;

  /**
   * Handles returning an user information.
   */
  findByUuid(userUuid: string): Promise<T | null>;
  
  /*
  *Updates user profile name, email, profile photo URL, and description by UUID.
  */
  updateProfileInfo(userUuid: string, updates: UpdateUserProfileDto): Promise<T | null>;

  /*
  *Retrieves all users.
  */
   getAllUsers(): Promise<R[]>;
}
