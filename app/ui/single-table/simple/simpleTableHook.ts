import { TableInfo } from "@/app/lib/utils/tableUtils";
import { MRT_TableInstance } from "mantine-react-table";
import { useState } from "react";
import { RecordWithID } from "../../table/view/tableScanHook";

export function useSimpleTable({
  table,
  tableInfo,
}: {
  table: MRT_TableInstance<RecordWithID>;
  tableInfo: TableInfo;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  // const [support];

  const attributeSet = new Set(tableInfo.attributes.map((attr) => attr.name));

  return {
    isSupportCollapsed: (fieldName: string) => attributeSet.has(fieldName),
    isCollapsed: (fieldName: string) =>
      (fieldName !== "Attributes" && collapsed[fieldName]) ?? true,
    setCollapse: (fieldName: string, collapse: boolean) => {
      setCollapsed((prev) => ({ ...prev, [fieldName]: collapse }));
    },
  };
}

export type SimpleTableHook = ReturnType<typeof useSimpleTable>;
