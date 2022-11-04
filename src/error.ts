export class BaseError extends Error {
  get Message(): string {
    return this.message
  }

  get Name(): string {
    return this.name
  }
}
