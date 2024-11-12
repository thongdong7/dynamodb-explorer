"use client";

import { useNav } from "@/app/lib/hook/nav";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AttributeValue,
  DescribeTableCommandOutput,
  GlobalSecondaryIndexDescription,
  ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { Button, Checkbox } from "antd";
import { ColumnType } from "antd/es/table";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import AttributesView from "./AttributesView";
import RecordValue, { getValue } from "./RecordValue";
import Table, { Column } from "./Table";
import TablePagination from "./TablePagination";

function keySchemaToColumns(item: GlobalSecondaryIndexDescription): MyColumn[] {
  if (!item.KeySchema) {
    return [];
  }

  return item.KeySchema.map((key) => {
    if (key.KeyType === "HASH") {
      return {
        title: `${key.AttributeName} (Partition Key)`,
        dataIndex: key.AttributeName,
        render: (value: AttributeValue) => (
          <SearchValue
            column={{
              dataIndex: key.AttributeName,
              indexName: item.IndexName,
            }}
            value={value}
          />
        ),
        indexName: item.IndexName,
        noWrap: true,
      };
    }
    if (key.KeyType === "RANGE") {
      return {
        title: `${key.AttributeName} (Sort Key)`,
        dataIndex: key.AttributeName,
        render: (value: AttributeValue) => <RecordValue value={value} />,
        noWrap: true,
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

type MyColumn = Column<RecordType> & {
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

  // Find fields appearing in all items and not in the key fields
  // This is used to display the attributes
  const allFields = new Set<string>();
  if (data.Items && data.Items.length > 0) {
    Object.keys(data.Items![0]).forEach((key) => {
      if (!keyFieldsSet.has(key)) {
        allFields.add(key);
      }
    });

    data.Items.slice(1).forEach((item) => {
      // Remove fields that are not in the current item
      allFields.forEach((field) => {
        if (!(field in item)) {
          allFields.delete(field);
        }
      });
    });
  }
  const attributes = Array.from(allFields);
  const attributesColumns = attributes.map((field) => ({
    title: field,
    dataIndex: field,
    render: (value: AttributeValue) => <RecordValue value={value} />,
  }));

  const ignoreFields = new Set([...keyFields, ...attributes]);

  const columns: MyColumn[] = [
    {
      title: `${pk} (Partition Key)`,
      dataIndex: pk,
      render: (value: AttributeValue) => (
        <SearchValue
          column={{
            dataIndex: pk,
          }}
          value={value}
        />
      ),
      ellipsis: true,
      isPK: true,
      freeze: true,
      noWrap: true,
    },
    {
      title: `${sk} (Sort Key)`,
      dataIndex: sk,
      render: (value: AttributeValue) => <RecordValue value={value} />,
      ellipsis: true,
      isSK: true,
      noWrap: true,
    },
    ...gsiColumns,
    ...attributesColumns,
    {
      title: "Attributes",
      render: (value: Record<string, AttributeValue>) => (
        <AttributesView ignoreFields={ignoreFields} item={value} />
      ),
    },
  ];

  const searchParams = useSearchParams();
  const pkField = searchParams.get("pkField");
  const pkValue = searchParams.get("pkValue");

  const { changeParams } = useNav();
  return (
    <div className="flex flex-col gap-2">
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
      <Table columns={columns} dataSource={data.Items} />

      <TablePagination LastEvaluatedKey={data.LastEvaluatedKey} />
    </div>
  );
}

function SearchValue({
  column,
  value,
}: {
  column: MyColumn;
  value?: AttributeValue;
}) {
  const { changeParams } = useNav();
  const { dataIndex, indexName } = column;
  if (value === undefined) {
    return <center className="text-gray-300">-</center>;
  }

  return (
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
      <RecordValue value={value} /> <SearchOutlined />
    </span>
  );
}
