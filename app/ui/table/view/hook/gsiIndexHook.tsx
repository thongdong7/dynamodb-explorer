import { TableInfo } from "@/app/lib/utils/tableUtils";
import { Space, Checkbox } from "antd";
import { useState } from "react";

export default function useGSIIndexHook(tableInfo: TableInfo) {
  const [selectedIndexes, setSelectedIndexes] = useState<string[]>([]);

  return {
    selectedIndexes,
    ignoreFields: tableInfo.gsiIndexes
      .filter((gsi) => !selectedIndexes.includes(gsi.name))
      .flatMap((gsi) => [gsi.pk, ...(gsi.sk ? [gsi.sk] : [])]),
    render: () => {
      return (
        <Space>
          {tableInfo.gsiIndexes.map((gsi) => {
            return (
              <Checkbox
                key={gsi.name}
                checked={selectedIndexes.includes(gsi.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIndexes([...selectedIndexes, gsi.name]);
                  } else {
                    setSelectedIndexes(
                      selectedIndexes.filter((name) => name !== gsi.name),
                    );
                  }
                }}
              >
                {gsi.name}
              </Checkbox>
            );
          })}
        </Space>
      );
    },
  };
}
