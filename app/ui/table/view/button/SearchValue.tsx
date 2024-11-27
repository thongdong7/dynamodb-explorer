import { useNav } from "@/app/lib/hook/nav";
import { SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";

export default function SearchValue({
  column,
  value,
}: {
  column: {
    dataIndex: string;
    indexName?: string;
  };
  value?: any;
}) {
  const { changeParams } = useNav();
  const { dataIndex, indexName } = column;
  if (value === undefined) {
    return <center className="text-gray-300">-</center>;
  }

  return (
    <div className="text-sky-500 text-nowrap">
      <Button
        type="text"
        icon={<SearchOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          changeParams({
            indexName,
            pkField: dataIndex as string,
            pkValue: value as string,
          });
        }}
      />{" "}
      {value}
    </div>
  );
}
