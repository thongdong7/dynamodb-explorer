import { useNav } from "@/app/lib/hook/nav";
import { SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { ReactNode } from "react";
import { getValue } from "../RecordValue";

export default function SearchValue({
  column,
  value,
}: {
  column: {
    dataIndex: string;
    indexName?: string;
  };
  value?: ReactNode;
}) {
  const { changeParams } = useNav();
  const { dataIndex, indexName } = column;
  if (value === undefined) {
    return <center className="text-gray-300">-</center>;
  }

  return (
    <div className="text-sky-500">
      {value}{" "}
      <Button
        type="text"
        icon={<SearchOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          changeParams({
            indexName,
            pkField: dataIndex as string,
            pkValue: getValue(value) as string,
          });
        }}
      />
    </div>
  );
}
