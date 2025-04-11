export interface IController<T> {
  create(data: T): Promise<T>;
}
