import { useRouter } from "next/navigation";

export function useBackRefresh() {
  const router = useRouter();

  return () => {
    router.back();
    setTimeout(() => {
      router.refresh();
    }, 100);
  };
}
