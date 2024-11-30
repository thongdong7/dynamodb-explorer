"use client";

import { useNav } from "@/app/lib/hook/nav";
import { humanFileSize } from "@/app/lib/utils/format";
import { TableInfo } from "@/app/lib/utils/tableUtils";
import { CloseCircleOutlined } from "@ant-design/icons";
import { ScanCommandOutput } from "@aws-sdk/client-dynamodb";
import { Button, Space } from "antd";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import SimpleTable from "../../single-table/simple/SimpleTable";
import ItemViewerDrawer from "./ItemViewerDrawer";
import TablePagination from "./TablePagination";
import { useTableInfo } from "./tableScanHook";

export default function TableScan({
  tableInfo,
  data,
  indexName,
}: {
  tableInfo: TableInfo;
  data: ScanCommandOutput;
  indexName?: string;
}) {
  const searchParams = useSearchParams();
  const pkField = searchParams.get("pkField");
  const pkValue = searchParams.get("pkValue");

  const { changeParams } = useNav();

  const [itemCount, setItemCount] = useState<number | undefined>(
    tableInfo.ItemCount,
  );
  const myTable = useTableInfo(tableInfo, data, {
    indexName,
    onCreateItem: (item) => {
      setItemCount((prev) => (prev ? prev + 1 : 1));
    },
    onDeleteItems: (items) => {
      setItemCount((prev) => (prev ? prev - items.length : 0));
    },
  });
  const { itemDrawer, selectItem } = myTable;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          {pkField && pkValue && (
            <Button
              type="text"
              onClick={() =>
                changeParams({ pkField: undefined, pkValue: undefined })
              }
              icon={<CloseCircleOutlined />}
              iconPosition="end"
            >
              {pkField}: {pkValue}
            </Button>
          )}
        </div>
        <Space>
          {itemCount && (
            <span>
              Count: <b>{itemCount.toLocaleString("en-US")}</b>
            </span>
          )}
          {tableInfo.TableSizeBytes && (
            <span>
              Size: <b>{humanFileSize(tableInfo.TableSizeBytes)}</b>
            </span>
          )}
          <TablePagination LastEvaluatedKey={data.LastEvaluatedKey} />
        </Space>
      </div>

      <SimpleTable table={myTable} tableInfo={tableInfo} />

      <ItemViewerDrawer
        item={selectItem}
        {...itemDrawer}
        tableInfo={tableInfo}
        deleteItemsAction={myTable.deleteItemsAction}
        onUpdateItem={myTable.onUpdateItem}
      />

      <TablePagination LastEvaluatedKey={data.LastEvaluatedKey} />
    </div>
  );
}
