import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (changes: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [name, value] of Object.entries(changes)) {
        if (value === undefined) {
          params.delete(name);
        } else {
          params.set(name, String(value));
        }
      }

      return params.toString();
    },
    [searchParams],
  );

  function changeParams(changes: Record<string, string | number | undefined>) {
    router.push(pathname + "?" + createQueryString(changes));
  }

  return {
    changeParams,
    getNumberParam(name: string, defaultValue: number) {
      return searchParams.get(name)
        ? parseInt(searchParams.get(name)!, 10)
        : defaultValue;
    },
  };
}
