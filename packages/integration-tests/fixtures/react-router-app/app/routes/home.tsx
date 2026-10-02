import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Class static blocks: Safari < 16.4 lacks them, so Nav's floor lowers this.
    class NavMarker {
      static {
        (globalThis as Record<string, unknown>).navMarker = NavMarker;
      }
    }
  }, []);
  return <p className="nav-marker-prefix nav-marker-color">ok</p>;
}
