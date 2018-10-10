export function Clamp<T>(min: number, max: number): PropertyDecorator {
  return (target, key) => {
    // tslint:disable-next-line:variable-name
    let _value: any;

    // tslint:disable-next-line:no-invalid-this
    console.log(target);
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      set(value) {
        _value = Math.max(min, Math.min(max, value));
      },
      get() {
        return _value;
      },
    });
  };
}
