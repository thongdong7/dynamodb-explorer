import { TableInfo } from "@/app/lib/utils/tableUtils";
import { Space, Checkbox } from "antd";
import { useState } from "react";

export default function useGSIIndexHook(
  tableInfo: TableInfo,
  {
    onChange,
  }: { onChange: (ignoreFields: string[], showFields: string[]) => void },
) {
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
                  let newIndexes: string[] = [];
                  if (e.target.checked) {
                    newIndexes = [...selectedIndexes, gsi.name];
                  } else {
                    newIndexes = selectedIndexes.filter(
                      (name) => name !== gsi.name,
                    );
                  }
                  setSelectedIndexes(newIndexes);
                  const ignoreFields = tableInfo.gsiIndexes
                    .filter((gsi) => !newIndexes.includes(gsi.name))
                    .flatMap((gsi) => [gsi.pk, ...(gsi.sk ? [gsi.sk] : [])]);
                  const showFields = tableInfo.gsiIndexes
                    .filter((gsi) => newIndexes.includes(gsi.name))
                    .flatMap((gsi) => [gsi.pk, ...(gsi.sk ? [gsi.sk] : [])]);

                  onChange(ignoreFields, showFields);
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
