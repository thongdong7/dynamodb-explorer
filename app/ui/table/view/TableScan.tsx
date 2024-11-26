"use client";

import { useNav } from "@/app/lib/hook/nav";
import { humanFileSize } from "@/app/lib/utils/format";
import { getTableInfo } from "@/app/lib/utils/tableUtils";
import { CloseOutlined } from "@ant-design/icons";
import { ScanCommandOutput, TableDescription } from "@aws-sdk/client-dynamodb";
import { Button, Space } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MRTSingleTable from "../../single-table/MRTSingleTable";
import ItemViewerDrawer from "./ItemViewerDrawer";
import TablePagination from "./TablePagination";
import { useTableInfo } from "./tableScanHook";

export default function TableScan({
  table,
  data,
}: {
  table: TableDescription;
  data: ScanCommandOutput;
}) {
  if (!table) {
    return <div>Table not found</div>;
  }
  const tableInfo = getTableInfo(table);

  const searchParams = useSearchParams();
  const pkField = searchParams.get("pkField");
  const pkValue = searchParams.get("pkValue");

  const { changeParams } = useNav();
  // const [_data, setData] = useState(data);

  // useEffect(() => {
  //   setData(data);
  // }, [data]);

  const [itemCount, setItemCount] = useState<number | undefined>(
    table.ItemCount,
  );
  const myTable = useTableInfo(tableInfo, data, {
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
      {/* <SampleTable /> */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          {/* {gsiIndexes.map((index) => (
            <Checkbox
              key={index.IndexName}
              checked={!hideGSIIndexes[index.IndexName!]}
              onChange={(e) =>
                setHideGSIIndexes((prev) => ({
                  ...prev,
                  [index.IndexName!]: !e.target.checked,
                }))
              }
            >
              {index.IndexName}
            </Checkbox>
          ))} */}
          {pkField && pkValue && (
            <Button
              type="text"
              onClick={() =>
                changeParams({ pkField: undefined, pkValue: undefined })
              }
              icon={<CloseOutlined />}
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
          {table.TableSizeBytes && (
            <span>
              Size: <b>{humanFileSize(table.TableSizeBytes)}</b>
            </span>
          )}
          <TablePagination LastEvaluatedKey={data.LastEvaluatedKey} />
        </Space>
      </div>

      <MRTSingleTable table={myTable} />

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
