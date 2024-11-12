"use client";

import {
  AttributeValue,
  DescribeTableCommandOutput,
  KeySchemaElement,
  ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { Checkbox, Table } from "antd";
import { ColumnType } from "antd/es/table";
import { uniq } from "lodash";
import RecordValue from "./RecordValue";
import { ReactNode, useState } from "react";
import AttributesView from "./AttributesView";
import TablePagination from "./TablePagination";

function keySchemaToColumns(
  keySchema: KeySchemaElement[],
): ColumnType<RecordType>[] {
  return keySchema.map((key) => {
    if (key.KeyType === "HASH") {
      return {
        title: `${key.AttributeName} (Partition Key)`,
        dataIndex: key.AttributeName,
        render: (value: AttributeValue) => <RecordValue value={value} />,
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
      .flatMap((item) => keySchemaToColumns(item.KeySchema!));
  }

  const keyFields: string[] = [
    pk,
    sk,
    ...gsiColumns.map((column) => column.dataIndex as string),
  ];
  const keyFieldsSet = new Set(keyFields);

  const columns: ColumnType<RecordType>[] = [
    {
      title: `${pk} (Partition Key)`,
      dataIndex: pk,
      render: (value: AttributeValue) => <RecordValue value={value} />,
      ellipsis: true,
    },
    {
      title: `${sk} (Sort Key)`,
      dataIndex: sk,
      render: (value: AttributeValue) => <RecordValue value={value} />,
      ellipsis: true,
    },
    ...gsiColumns,
    {
      title: "Attributes",
      render: (value: Record<string, AttributeValue>) => (
        <AttributesView ignoreFields={keyFieldsSet} item={value} />
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-2">
      {/* <div className="border relative rounded-xl">
        <div className="shadow-sm overflow-hidden my-4"> */}
      <div>
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
      </div>
      <table className="border-collapse table-auto w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            {columns.map(({ title }, i) => (
              <th key={i} className="border-b py-2 text-slate-400 text-left">
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
              <tr key={i}>
                {columns.map((column, j) => {
                  const content = renderColumn(column, item, i);
                  return (
                    <td
                      key={j}
                      className="border-b border-slate-100 text-ellipsis overflow-hidden"
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <TablePagination LastEvaluatedKey={data.LastEvaluatedKey} />
      {/* </div>
      </div> */}
      {/* <Table
        dataSource={data.Items}
        columns={[
          {
            title: `${pk} (Partition Key)`,
            dataIndex: pk,
            render: (value) => <RecordValue value={value} />,
            ellipsis: true,
            },
            {
            title: `${sk} (Sort Key)`,
            dataIndex: sk,
            render: (value) => <RecordValue value={value} />,
            ellipsis: true,
          },
          ...gsiColumns,
          //   ...remainFields.map((field) => ({
          //     title: field,
          //     dataIndex: field,
          //     render: (value: AttributeValue) => <RecordValue value={value} />,
          //   })),
        ]}
        expandable={{
          expandedRowRender: (record, index) => {
            const item = Items[index];
            const remainFields = uniq(
              Object.keys(item)?.filter((field) => !keyFieldsSet.has(field)) ||
                [],
            );
            return (
              <Table
                columns={remainFields.map((field) => ({
                  title: field,
                  dataIndex: field,
                  render: (value: AttributeValue) => (
                    <RecordValue value={value} />
                  ),
                }))}
                dataSource={[item]}
                pagination={false}
              />
            );
          },
          defaultExpandedRowKeys: ["0"],
        }}
        pagination={false}
      /> */}
      {/* <pre>{JSON.stringify(table, null, 2)}</pre>
      <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
}

function renderColumn(
  column: ColumnType<RecordType>,
  record: RecordType,
  index: number,
) {
  const { dataIndex, render } = column;
  // @ts-expect-error
  const value = dataIndex ? record[dataIndex] : record;
  if (render) {
    return render(value, record, index);
  }

  return value;
}
