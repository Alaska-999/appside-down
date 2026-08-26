import { useEffect, useState } from "react";

export function useDelayedLoading(loading: boolean, delay = 250) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShow(false);
      return;
    }
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [loading, delay]);

  return loading && show;
}
