/** https://gist.github.com/sunnyy02/2477458d4d1c08bde8cc06cd8f56702e#file-deepclone-ts */
export class cloneable {
  /**
     * Return a deep copy of an object
     *
     * @param source <T> source to copy
     * @returns deep copy of object<T>
     */
  public static deepCopy<T> (source: T): T {
    return Array.isArray(source)
      ? source.map(item => this.deepCopy(item))
      : source instanceof Date
        ? new Date(source.getTime())
        : source && typeof source === 'object'
          ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
            Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop)!)
            o[prop] = this.deepCopy((source as { [key: string]: any })[prop])
            return o
          }, Object.create(Object.getPrototypeOf(source)))
          : source as T
  }
}
