import { useNav } from "@/app/lib/hook/nav";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { Button, Select } from "antd";

export default function TablePagination({
  LastEvaluatedKey,
}: {
  LastEvaluatedKey?: Record<string, AttributeValue>;
}) {
  const { changeParams, getNumberParam } = useNav();

  const page = getNumberParam("page", 1);

  return (
    <div className="flex gap-2 items-center">
      <Select<number>
        value={getNumberParam("limit", 25)}
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
          changeParams({ limit: value });
        }}
        className="w-20"
      />
      {page > 1 && (
        <Button
          type="link"
          onClick={() => {
            changeParams({
              startKey: "",
              page: 1,
            });
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
            changeParams({
              startKey: JSON.stringify(LastEvaluatedKey),
              page: page + 1,
            });
          }}
        >
          Next page
        </Button>
      )}
    </div>
  );
}
