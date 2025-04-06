export interface IRepository<T> {
    create(data: T): Promise<T>;
  }
  