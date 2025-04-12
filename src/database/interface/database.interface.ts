/** 
 * The `IRepository` interface defines a contract for repository services, requiring a `create` method 
 * to create and return an entity of type `T`.
 */
export interface IRepository<T> {
  create(data: T): Promise<T>;
}
