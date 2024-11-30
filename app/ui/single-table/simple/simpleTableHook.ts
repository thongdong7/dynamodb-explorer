import { TableInfo } from "@/app/lib/utils/tableUtils";
import { useState } from "react";

export function useSimpleTable({ tableInfo }: { tableInfo: TableInfo }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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
