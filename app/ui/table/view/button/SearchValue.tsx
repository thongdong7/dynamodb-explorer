import { useNav } from "@/app/lib/hook/nav";
import { SearchOutlined } from "@ant-design/icons";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import RecordValue, { getValue } from "../RecordValue";

export default function SearchValue({
  column,
  value,
}: {
  column: {
    dataIndex: string;
    indexName?: string;
  };
  value?: AttributeValue;
}) {
  const { changeParams } = useNav();
  const { dataIndex, indexName } = column;
  if (value === undefined) {
    return <center className="text-gray-300">-</center>;
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        changeParams({
          indexName,
          pkField: dataIndex as string,
          pkValue: getValue(value) as string,
        });
      }}
      className="hover:underline text-sky-500 cursor-pointer flex gap-1"
    >
      <RecordValue value={value} /> <SearchOutlined />
    </div>
  );
}
