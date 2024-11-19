"use client";

import { useNav } from "@/app/lib/hook/nav";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AttributeValue,
  TableDescription,
  GlobalSecondaryIndexDescription,
  ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { Button, Checkbox, Space } from "antd";
import { ColumnType } from "antd/es/table";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AttributesView from "./AttributesView";
import RecordValue, { getValue } from "./RecordValue";
import SingleTable, { Column } from "../../single-table/SingleTable";
import TablePagination from "./TablePagination";
import { useOpen } from "@/app/lib/hook/open";
import ItemViewerDrawer from "./ItemViewerDrawer";
import { humanFileSize } from "@/app/lib/utils/format";
import { getTableInfo } from "@/app/lib/utils/tableUtils";

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
  table: TableDescription;
  data: ScanCommandOutput;
}) {
  if (!table) {
    return <div>Table not found</div>;
  }
  const tableInfo = getTableInfo(table);

  const pk = tableInfo.pk;
  const sk = tableInfo.sk;

  let gsiColumns: ColumnType<RecordType>[] = [];
  const gsiIndexes = (table.GlobalSecondaryIndexes ?? []).filter(
    (item) => item.IndexName,
  );
  const [hideGSIIndexes, setHideGSIIndexes] = useState<Record<string, boolean>>(
    {},
  );
  let gsiFields: string[] = [];
  if (table.GlobalSecondaryIndexes) {
    gsiColumns = gsiIndexes
      .filter((item) => !hideGSIIndexes[item.IndexName!])
      .flatMap((item) => keySchemaToColumns(item));
    gsiFields = gsiIndexes
      .flatMap((item) => item.KeySchema?.map((key) => key.AttributeName) ?? [])
      .filter((item) => item !== undefined);
  }

  const keyFields: string[] = [
    pk,
    ...(sk ? [sk] : []),
    // ...gsiColumns.map((column) => column.dataIndex as string),
    ...gsiFields,
  ];
  const keyFieldsSet = new Set(keyFields);

  const [items, setItems] = useState<
    Record<string, AttributeValue>[] | undefined
  >(data.Items);

  useEffect(() => {
    setItems(data.Items);
  }, [data.Items]);

  // Find fields appearing in all items and not in the key fields
  // This is used to display the attributes
  const allFields = new Set<string>();
  let hasOtherAttributes = false;
  if (items && items.length > 0) {
    Object.keys(items![0]).forEach((key) => {
      if (!keyFieldsSet.has(key)) {
        allFields.add(key);
      }
    });

    items.slice(1).forEach((item) => {
      // Remove fields that are not in the current item
      allFields.forEach((field) => {
        if (!(field in item)) {
          allFields.delete(field);
          hasOtherAttributes = true;
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
    ...(sk
      ? [
          {
            title: `${sk} (Sort Key)`,
            dataIndex: sk,
            render: (value: AttributeValue) => <RecordValue value={value} />,
            ellipsis: true,
            isSK: true,
            noWrap: true,
            freeze: true,
          },
        ]
      : []),
    ...gsiColumns,
    ...attributesColumns,
    {
      title: "Attributes",
      hidden: !hasOtherAttributes,
      render: (value: Record<string, AttributeValue>) => (
        <AttributesView ignoreFields={ignoreFields} item={value} />
      ),
    },
  ];

  const searchParams = useSearchParams();
  const pkField = searchParams.get("pkField");
  const pkValue = searchParams.get("pkValue");

  const { changeParams } = useNav();
  const itemDrawer = useOpen();
  const [selectItem, setSelectItem] = useState<
    Record<string, AttributeValue> | undefined
  >(undefined);
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
        <Space>
          {table.ItemCount && (
            <span>
              Count: <b>{table.ItemCount.toLocaleString("en-US")}</b>
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

      <SingleTable
        columns={columns}
        dataSource={items}
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              setSelectItem(record);
              itemDrawer.onOpen();
            },
          };
        }}
      />

      <ItemViewerDrawer
        item={selectItem}
        {...itemDrawer}
        tableInfo={tableInfo}
        onDeleted={() => {
          const nextItems = items?.filter((item) => item !== selectItem);
          setItems(nextItems);
        }}
      />

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
      onClick={(e) => {
        e.stopPropagation();
        changeParams({
          indexName,
          pkField: dataIndex as string,
          pkValue: getValue(value) as string,
        });
      }}
      className="hover:underline text-sky-500 cursor-pointer"
    >
      <RecordValue value={value} /> <SearchOutlined />
    </span>
  );
}
