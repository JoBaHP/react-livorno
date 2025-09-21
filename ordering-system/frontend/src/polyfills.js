// Provide missing built-ins for environments without Object.hasOwn
try {
  if (typeof Object.hasOwn !== "function") {
    Object.defineProperty(Object, "hasOwn", {
      value(target, property) {
        return Object.prototype.hasOwnProperty.call(Object(target), property);
      },
      configurable: true,
      writable: true
    });
  }
} catch (error) {
  // Swallow errors if the runtime forbids redefining intrinsics
}
