import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { Button, Select } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parse } from "path";
import { useCallback } from "react";

export default function TablePagination({
  LastEvaluatedKey,
}: {
  LastEvaluatedKey?: Record<string, AttributeValue>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (changes: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [name, value] of Object.entries(changes)) {
        params.set(name, String(value));
      }

      return params.toString();
    },
    [searchParams],
  );

  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page")!, 10)
    : 1;

  return (
    <div className="flex gap-2 items-center">
      <Select<number>
        value={
          searchParams.get("limit")
            ? parseInt(searchParams.get("limit")!, 10)
            : 10
        }
        options={[
          { label: "10", value: 10 },
          { label: "25", value: 25 },
          { label: "50", value: 50 },
          { label: "100", value: 100 },
          { label: "250", value: 250 },
          { label: "500", value: 500 },
          { label: "1000", value: 1000 },
        ]}
        onChange={(value) => {
          router.push(pathname + "?" + createQueryString({ limit: value }));
        }}
        className="w-20"
      />
      {page > 1 && (
        <Button
          type="link"
          onClick={() => {
            router.push(
              pathname +
                "?" +
                createQueryString({
                  startKey: "",
                  page: 1,
                }),
            );
          }}
        >
          First page
        </Button>
      )}
      <div>Page {page}</div>
      {LastEvaluatedKey && (
        <Button
          type="link"
          onClick={() => {
            router.push(
              pathname +
                "?" +
                createQueryString({
                  startKey: JSON.stringify(LastEvaluatedKey),
                  page: page + 1,
                }),
            );
          }}
        >
          Next page
        </Button>
      )}
    </div>
  );
}
