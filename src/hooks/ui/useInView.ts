import { useEffect, useRef, useState } from "react";

/** Whether the referenced element is on screen (IntersectionObserver). */
export function useInView<Element extends HTMLElement>(rootMargin = "200px") {
  const ref = useRef<Element | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
