import {
  getTableKey,
  TableInfo,
  tableInfoKeyQueryString,
} from "@/app/lib/utils/tableUtils";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { App, Button, Drawer, Space, Tabs } from "antd";
import MyJsonViewer from "../../common/MyJsonViewer";
import { TableScanHook } from "./tableScanHook";
import CreateItemButton from "../../item/CreateItemButton";
import { useState } from "react";

function formatItem(item: Record<string, AttributeValue>) {
  let ret: Record<string, any> = {};
  for (const [key, value] of Object.entries(item)) {
    ret[key] =
      value.S ||
      value.N ||
      value.B ||
      value.BOOL ||
      value.NULL ||
      value.L ||
      value.M ||
      value;
  }

  return ret;
}

export default function ItemViewerDrawer({
  item,
  onClose,
  open,
  tableInfo,
  deleteItemsAction,
  onUpdateItem,
}: {
  item?: Record<string, AttributeValue>;
  onClose: () => void;
  open: boolean;
  tableInfo: TableInfo;
  deleteItemsAction: TableScanHook["deleteItemsAction"];
  onUpdateItem: TableScanHook["onUpdateItem"];
}) {
  if (!item) {
    return null;
  }

  const [_item, setItem] = useState<Record<string, any>>(item);

  const { modal } = App.useApp();

  return (
    <Drawer
      onClose={onClose}
      open={open}
      size="large"
      extra={
        <Space>
          <CreateItemButton
            tableInfo={tableInfo}
            item={item}
            onSuccess={(newItem) => {
              setItem(newItem);
              onUpdateItem(newItem);
            }}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deleteItemsAction.loading}
            onClick={() => {
              modal.confirm({
                title: "Are you sure?",
                content: "Do you want to delete this item?",
                onOk: async () => {
                  await deleteItemsAction.run({
                    keys: [getTableKey(tableInfo, item)],
                  });

                  onClose();
                },
              });
            }}
          >
            Delete
          </Button>
        </Space>
      }
      classNames={{
        body: "bg-gray-950",
      }}
    >
      <MyJsonViewer value={_item} />
    </Drawer>
  );
}
