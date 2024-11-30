import { deleteItemsAPI } from "@/app/lib/actions/item/delete";
import { useAction } from "@/app/lib/hook/action";
import { useOpen } from "@/app/lib/hook/open";
import { MyAttribute, TableInfo } from "@/app/lib/utils/tableUtils";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { AttributeValue, ScanCommandOutput } from "@aws-sdk/client-dynamodb";
import { App, Button, Popconfirm } from "antd";
import { isEqual } from "lodash";
import { MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";
import { useEffect, useState } from "react";
import CreateItemButton from "../../item/CreateItemButton";
import { $id } from "../../single-table/common";
import AttributesView from "./AttributesView";
import SearchValue from "./button/SearchValue";

export type RecordType = Record<string, AttributeValue>;

export type RecordWithID = {
  [$id]: string;
} & RecordType;

function buildID(item: RecordType, tableInfo: TableInfo): RecordWithID {
  let _id: string = String(item[tableInfo.pk]);
  if (tableInfo.sk) {
    _id += `#${String(item[tableInfo.sk])}`;
  }

  return {
    [$id]: _id,
    ...item,
  };
}

function buildIDs(items: RecordType[], tableInfo: TableInfo): RecordWithID[] {
  return items.map((item) => buildID(item, tableInfo));
}

export type TableScanHook = ReturnType<typeof useTableInfo>;

function isAllSameAttributes(items: RecordWithID[]) {
  if (items.length === 0) {
    return true;
  }
  const firstItem = items[0];
  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    if (Object.keys(item).length !== Object.keys(firstItem).length) {
      return false;
    }
    for (const key in item) {
      if (!(key in firstItem)) {
        return false;
      }
    }
  }
  return true;
}

function attrToColumn(
  items: RecordWithID[],
  attr: MyAttribute,
): MRT_ColumnDef<RecordWithID> {
  return {
    accessorKey: `${attr.name}`,
    header: attr.name,
    enableClickToCopy: true,
    Cell:
      attr.kind === "pk" || attr.kind === "gsiPk"
        ? ({ cell }) => (
            <SearchValue
              column={{
                dataIndex: attr.name,
                indexName: attr.indexName,
              }}
              value={cell.getValue<any>()}
            />
          )
        : undefined,
    size: 0,
    mantineTableBodyCellProps({ cell, row, column }) {
      if (attr.kind !== "pk" && attr.kind !== "gsiPk") {
        return {};
      }
      // return {};
      const record = row.original;
      const previousRecord = row.index >= 1 ? items[row.index - 1] : undefined;
      if (previousRecord && previousRecord[attr.name] === record[attr.name]) {
        return {
          rowSpan: 0,
        };
      }

      // Find the number of rows that have the same value
      let rowSpan = 1;
      for (let i = row.index + 1; i < items.length; i++) {
        if (items[i][attr.name] === record[attr.name]) {
          rowSpan++;
        } else {
          break;
        }
      }

      return {
        rowSpan,
      };
    },
  };
}
function calculateColumns({
  indexName,
  tableInfo,
  items,
}: {
  indexName?: string;
  tableInfo: TableInfo;
  items: RecordWithID[];
}) {
  const attributes: MyAttribute[] = [];
  const allFields = new Set<string>();
  const allFields2 = new Set<string>();
  const keyFieldsSet = new Set<string>(
    tableInfo.attributes.map((attr) => attr.name),
  );

  if (items && items.length > 0) {
    Object.keys(items![0]).forEach((key) => {
      if (!keyFieldsSet.has(key)) {
        allFields.add(key);
        allFields2.add(key);
      }
    });

    items.slice(1).forEach((item) => {
      Object.keys(item).forEach((key) => allFields2.add(key));
      // Remove fields that are not in the current item
      allFields.forEach((field) => {
        if (!(field in item)) {
          allFields.delete(field);
        }
      });
    });

    Object.keys(items![0]).forEach((key) => {
      if (allFields.has(key)) {
        const obj = items![0][key];
        const type = Object.keys(obj)[0] as "S" | "N" | "B";
        attributes.push({
          name: key,
          type,
          kind: "attribute",
          indexName: undefined,
        });
      }
    });
  }

  const allAttributes = tableInfo.attributes.concat(attributes);
  const sameAttributes = allAttributes;
  const sameAttributesSet = new Set(allAttributes.map((attr) => attr.name));

  const indexAttributes = tableInfo.attributes.filter(
    (attr) => attr.indexName === indexName,
  );

  const noneIndexAttributes = tableInfo.attributes.filter(
    (attr) => attr.indexName !== indexName,
  );

  const columns: MRT_ColumnDef<RecordWithID>[] = [
    ...indexAttributes.map((attr) => attrToColumn(items, attr)),
    ...noneIndexAttributes.map((attr) => attrToColumn(items, attr)),
    ...attributes.map((attr) => {
      return {
        accessorKey: `${attr.name}`,
        header: attr.name,
        enableClickToCopy: true,
      };
    }),
    {
      header: "Attributes",
      Cell: ({ row }) => {
        return (
          <AttributesView
            item={row.original}
            ignoreFields={sameAttributesSet}
          />
        );
      },
      // getIsVisible: () => allFields2.size !== attributes.length,

      mantineTableHeadCellProps: {
        sx: {
          width: "100%",
          overflow: "none",
        },
      },
      mantineTableBodyCellProps: {
        sx: {
          width: "100%",
          overflow: "none",
        },
      },
      enableResizing: true,
    },
  ];

  return {
    columns,
    isAllSameAttributes: isAllSameAttributes(items),
    sameAttributes,
    sameAttributesSet,
  };
}

export function useTableInfo(
  tableInfo: TableInfo,
  data: ScanCommandOutput,
  {
    indexName,
    onCreateItem,
    onDeleteItems,
  }: {
    indexName?: string;
    onCreateItem: (item: Record<string, any>) => void;
    onDeleteItems: (items: Record<string, any>[]) => void;
  },
) {
  const [items, setItems] = useState<RecordWithID[]>(
    buildIDs(data.Items ?? [], tableInfo),
  );

  // const gsiIndexes = useGSIIndexHook(tableInfo, {
  //   onChange: (ignoreFields, showFields) => {
  //     table.setColumnVisibility((prev) => {
  //       const newColumnVisibility = { ...prev };
  //       ignoreFields.forEach((field) => {
  //         newColumnVisibility[field] = false;
  //       });
  //       showFields.forEach((field) => {
  //         newColumnVisibility[field] = true;
  //       });
  //       return newColumnVisibility;
  //     });
  //   },
  // });
  useEffect(() => {
    setItems(buildIDs(data.Items ?? [], tableInfo));
    table.reset();

    // const columnVisibility: Record<string, boolean> = {};
    // // Hide gsiIndexes.ignoreFields columns
    // tableInfo.attributes.forEach((attr) => {
    //   columnVisibility[attr.name] = !gsiIndexes.ignoreFields.includes(
    //     attr.name,
    //   );
    // });
    // table.setColumnVisibility((prev) => ({ ...prev, ...columnVisibility }));
  }, [data.Items]);

  const [result, setResult] = useState<ReturnType<typeof calculateColumns>>(
    calculateColumns({
      indexName,
      tableInfo,
      items,
      // ignoreFields: gsiIndexes.ignoreFields,
    }),
  );

  useEffect(() => {
    setResult(
      calculateColumns({
        indexName,
        tableInfo,
        items,
        // ignoreFields: gsiIndexes.ignoreFields,
      }),
    );
  }, [items, tableInfo]);

  useEffect(() => {
    table.setColumnVisibility((prev) => ({
      ...prev,
      Attributes: !result.isAllSameAttributes,
    }));
  }, [result.isAllSameAttributes]);

  const itemDrawer = useOpen();
  const [selectItem, setSelectItem] = useState<RecordWithID | undefined>(
    undefined,
  );

  const deleteItemsAction = useAction<
    { keys: Record<string, any>[] },
    true,
    {
      tableName: string;
    }
  >({
    action: deleteItemsAPI,
    extraValues: { tableName: tableInfo.name },
    beforeRun: async ({ keys }) => {
      const ids = new Set(buildIDs(keys, tableInfo).map((item) => item[$id]));
      setItems((prevItems) => prevItems.filter((item) => !ids.has(item[$id])));
    },
    onSuccess: (data, { keys }) => {
      onDeleteItems(keys);
      message.success(`Item${keys.length > 1 ? "s" : ""} deleted successfully`);
    },
  });
  const pk = tableInfo.pk;
  const sk = tableInfo.sk;

  function getKey(item: RecordWithID): Record<string, any> {
    const key: Record<string, any> = {
      [pk]: item[pk],
    };
    if (sk) {
      key[sk] = item[sk];
    }
    return key;
  }

  const { message } = App.useApp();
  const table = useMantineReactTable<RecordWithID>({
    columns: result.columns,
    data: items,
    enableBottomToolbar: false,
    enableColumnResizing: true,
    enableColumnVirtualization: true,
    enableGlobalFilterModes: true,
    enablePagination: false,
    enableColumnPinning: true,
    enableStickyHeader: true,
    enableRowVirtualization: true,
    mantineTableContainerProps: {
      style: {
        maxHeight: "100%",
      },
    },
    rowVirtualizerProps: { overscan: 10 }, //optionally customize the row virtualizer
    columnVirtualizerProps: { overscan: 10 }, //optionally customize the column virtualizer
    enableRowSelection: true,
    enableRowActions: true,
    enableDensityToggle: false,
    positionToolbarAlertBanner: "none",
    renderRowActions: ({ row, table }) => (
      <div>
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectItem(row.original);
            itemDrawer.onOpen();
          }}
        />
        <Popconfirm
          title="Are you sure to delete this item?"
          onConfirm={() => {
            deleteItemsAction.run({
              keys: [getKey(row.original)],
            });
          }}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </div>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="flex gap-2 flex-1 justify-between">
        <div className="flex gap-2">
          <Popconfirm
            title="Are you sure to delete selected items?"
            okText="Yes"
            onConfirm={async () => {
              const ids = Object.keys(table.getState().rowSelection);
              if (ids.length === 0) {
                return;
              }
              const selectedKeys = ids
                .map((id) => table.getRow(id).original)
                .map((item) => getKey(item));

              table.setRowSelection({});
              await deleteItemsAction.run({
                keys: selectedKeys,
              });
            }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              // loading={deletingItems}
              disabled={isEqual(table.getState().rowSelection, {})}
            >
              Delete items
            </Button>
          </Popconfirm>
          {/* {gsiIndexes.render()} */}
        </div>
        <div className="flex gap-2 items-center">
          <CreateItemButton
            tableInfo={tableInfo}
            onSuccess={(item) => {
              // console.log(item);
              setItems((prev) => [buildID(item, tableInfo), ...prev]);
            }}
          />
        </div>
      </div>
    ),
    initialState: {
      density: "xs",
      // columnVisibility,
    },
    displayColumnDefOptions: {
      "mrt-row-actions": {
        size: 0,
      },
      "mrt-row-select": {
        size: 0,
        mantineTableHeadCellProps: {
          sx: {
            minWidth: 0,
            width: 0,
          },
        },
        mantineTableBodyCellProps: {
          sx: {
            minWidth: 0,
            width: 0,
          },
        },
      },
    },
    mantineTableBodyCellProps: {
      style: { padding: 0 },
    },
    getRowId: (row) => row[$id],
  });

  return {
    table,
    indexName,
    sameAttributes: result.sameAttributes,
    sameAttributesSet: result.sameAttributesSet,
    itemDrawer,
    selectItem,
    setSelectItem,
    deleteItemsAction,
    onUpdateItem: (item: Record<string, any>) => {
      setItems((prev) => {
        const id = buildID(item, tableInfo)[$id];
        return prev.map((prevItem) =>
          prevItem[$id] === id ? buildID(item, tableInfo) : prevItem,
        );
      });
    },
    onCreateItem: (item: Record<string, any>) => {
      setItems((prev) => [buildID(item, tableInfo), ...prev]);
      onCreateItem(item);
    },
  };
}
