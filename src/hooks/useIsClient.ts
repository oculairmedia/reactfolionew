import { useState, useEffect } from "react";

/** Returns false on server and during first client render (hydration), true after mount. */
export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
};
