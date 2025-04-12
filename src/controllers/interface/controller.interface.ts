/** 
 * The `IController` interface defines a contract for controllers, requiring a `create` method 
 * to handle creating and returning an entity of type `T`.
 */
export interface IController<T> {
  create(data: T): Promise<T>;
  updateLocation(id: number, latitude: number, longitude: number): Promise<T>;
}
