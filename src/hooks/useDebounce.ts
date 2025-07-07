import { useEffect, useState } from "react";

const useDebounce = <T>(value: T, delay: number): T => {
  const [debounceQuery, setDebounceQuery] = useState(value);
  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounceQuery(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);
  return debounceQuery;
};

export default useDebounce;
