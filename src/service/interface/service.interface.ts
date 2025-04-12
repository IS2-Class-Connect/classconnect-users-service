/** 
 * The `IService` interface defines a contract for services, requiring a `create` method 
 * to handle the creation and return of an entity of type `T`.
 */
export interface IService<T> {
  create(data: T): Promise<T>;
  setLocation(id: number, latitude: number, longitude: number): Promise<T>;
}
