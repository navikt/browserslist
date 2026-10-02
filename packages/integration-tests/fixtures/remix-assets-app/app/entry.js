// Class static blocks: Safari < 16.4 lacks them, so Nav's floor lowers this.
export class NavMarker {
  static {
    globalThis.navMarker = NavMarker;
  }
}
