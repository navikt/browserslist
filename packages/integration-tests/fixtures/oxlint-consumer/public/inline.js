// Served as-is (no bundler): the unbundled preset applies on top, so ES2022+
// syntax like a class static block must be flagged.
export class Flags {
  static {
    globalThis.flagsReady = true;
  }
}
