"use client";

import {
  AttributeValue,
  DescribeTableCommandOutput,
  GlobalSecondaryIndexDescription,
  KeySchemaElement,
  ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { Button, Checkbox, Table } from "antd";
import { ColumnType } from "antd/es/table";
import { uniq } from "lodash";
import RecordValue, { getValue } from "./RecordValue";
import { ReactNode, useState } from "react";
import AttributesView from "./AttributesView";
import TablePagination from "./TablePagination";
import Link from "next/link";
import { useNav } from "@/app/lib/hook/nav";
import { useSearchParams } from "next/navigation";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import clsx from "clsx";

function keySchemaToColumns(item: GlobalSecondaryIndexDescription): MyColumn[] {
  if (!item.KeySchema) {
    return [];
  }

  return item.KeySchema.map((key) => {
    if (key.KeyType === "HASH") {
      return {
        title: `${key.AttributeName} (Partition Key)`,
        dataIndex: key.AttributeName,
        render: (value: AttributeValue) => <RecordValue value={value} />,
        indexName: item.IndexName,
      };
    }
    if (key.KeyType === "RANGE") {
      return {
        title: `${key.AttributeName} (Sort Key)`,
        dataIndex: key.AttributeName,
        render: (value: AttributeValue) => <RecordValue value={value} />,
      };
    }
    return {
      title: key.AttributeName,
      dataIndex: key.AttributeName,
      render: (value) => <RecordValue value={value} />,
    };
  });
}

type ArrayElement<T> = T extends (infer U)[] ? U : never;
type RecordType = ArrayElement<ScanCommandOutput["Items"]>;

type MyColumn = ColumnType<RecordType> & {
  isPK?: boolean;
  isSK?: boolean;
  indexName?: string;
};

export default function TableScan({
  table,
  data,
}: {
  table: DescribeTableCommandOutput;
  data: ScanCommandOutput;
}) {
  if (!table.Table) {
    return <div>Table not found</div>;
  }

  const pk = table.Table.KeySchema?.find(
    (key) => key.KeyType === "HASH",
  )?.AttributeName;

  if (!pk) {
    return <div>Table does not have a primary key</div>;
  }

  const sk = table.Table.KeySchema?.find(
    (key) => key.KeyType === "RANGE",
  )?.AttributeName;

  if (!sk) {
    return <div>Table does not have a sort key</div>;
  }

  let gsiColumns: ColumnType<RecordType>[] = [];
  const gsiIndexes = (table.Table.GlobalSecondaryIndexes ?? []).filter(
    (item) => item.IndexName,
  );
  const [hideGSIIndexes, setHideGSIIndexes] = useState<Record<string, boolean>>(
    {},
  );
  if (table.Table.GlobalSecondaryIndexes) {
    gsiColumns = gsiIndexes
      .filter((item) => !hideGSIIndexes[item.IndexName!])
      .flatMap((item) => keySchemaToColumns(item));
  }

  const keyFields: string[] = [
    pk,
    sk,
    ...gsiColumns.map((column) => column.dataIndex as string),
  ];
  const keyFieldsSet = new Set(keyFields);

  const columns: MyColumn[] = [
    {
      title: `${pk} (Partition Key)`,
      dataIndex: pk,
      render: (value: AttributeValue) => <RecordValue value={value} />,
      ellipsis: true,
      isPK: true,
    },
    {
      title: `${sk} (Sort Key)`,
      dataIndex: sk,
      render: (value: AttributeValue) => <RecordValue value={value} />,
      ellipsis: true,
      isSK: true,
    },
    ...gsiColumns,
    {
      title: "Attributes",
      render: (value: Record<string, AttributeValue>) => (
        <AttributesView ignoreFields={keyFieldsSet} item={value} />
      ),
    },
  ];

  const searchParams = useSearchParams();
  const pkField = searchParams.get("pkField");
  const pkValue = searchParams.get("pkValue");

  const { changeParams } = useNav();
  return (
    <div className="flex1 flex-col1 gap-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          {gsiIndexes.map((index) => (
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
          ))}
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
        <TablePagination LastEvaluatedKey={data.LastEvaluatedKey} />
      </div>
      <table className="border-collapse min-w-full text-sm">
        <thead className="bg-slate-100 sticky top-0 z-10">
          <tr>
            {columns.map(({ title, isPK, isSK }, i) => (
              <th
                key={i}
                className={clsx("border-b p-2 text-slate-400 text-left", {
                  "sticky left-0 bg-gray-200": isPK,
                })}
              >
                {title as ReactNode}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.Items === undefined ? (
            <div>No data</div>
          ) : (
            data.Items.map((item, i) => (
              <tr key={i} className="hover:bg-slate-50 group">
                {columns.map((column, j) => {
                  return (
                    <td
                      key={j}
                      className={clsx(
                        "border-b border-slate-100 1truncate 1max-w-28 px-2",
                        {
                          "sticky bg-gray-200 group-hover:bg-gray-100":
                            column.isPK,
                          "left-0": column.isPK,
                          "whitespace-nowrap": column.isPK,
                        },
                      )}
                    >
                      <ColumnContent column={column} record={item} index={i} />
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <TablePagination LastEvaluatedKey={data.LastEvaluatedKey} />
    </div>
  );
}

function ColumnContent({
  column,
  record,
  index,
}: {
  column: MyColumn;
  record: RecordType;
  index: number;
}) {
  const { dataIndex, render, indexName, isPK } = column;
  const { changeParams } = useNav();
  // @ts-expect-error
  const value = dataIndex ? record[dataIndex] : record;
  if (render) {
    let content = render(value, record, index) as ReactNode;
    if ((isPK || indexName) && value !== undefined) {
      content = (
        <span
          onClick={() =>
            changeParams({
              indexName,
              pkField: dataIndex as string,
              pkValue: getValue(value) as string,
            })
          }
          className="hover:underline text-sky-500 cursor-pointer"
        >
          {content} <SearchOutlined />
        </span>
      );
    }

    return content;
  }

  return value;
}
