import {
  getTableKey,
  TableInfo,
  tableInfoKeyQueryString,
} from "@/app/lib/utils/tableUtils";
import { EditOutlined } from "@ant-design/icons";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { App, Button, Drawer, Space, Tabs } from "antd";
import MyJsonViewer from "../../common/MyJsonViewer";
import DeleteItemButton from "./DeleteItemButton";

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
  onDeleted,
}: {
  item?: Record<string, AttributeValue>;
  onClose: () => void;
  open: boolean;
  tableInfo: TableInfo;
  onDeleted: (item: Record<string, AttributeValue>) => void;
}) {
  if (!item) {
    return null;
  }

  const formattedItem = formatItem(item);
  const { message } = App.useApp();

  return (
    <Drawer
      onClose={onClose}
      open={open}
      size="large"
      extra={
        <Space>
          <Button
            type="primary"
            href={`/table/${tableInfo.name}/edit?${tableInfoKeyQueryString(tableInfo, formattedItem)}`}
            icon={<EditOutlined />}
          >
            Edit
          </Button>
          <DeleteItemButton
            tableName={tableInfo.name}
            itemKey={getTableKey(tableInfo, formattedItem)}
            onDeleted={() => {
              message.success("Item deleted successfully");
              onClose();
              onDeleted(item);
            }}
          />
        </Space>
      }
    >
      <Tabs
        defaultActiveKey="formatted"
        items={[
          {
            key: "formatted",
            label: "Formatted",
            children: <MyJsonViewer value={formattedItem} />,
          },
          {
            key: "raw",
            label: "Raw",
            children: <MyJsonViewer value={item} />,
          },
        ]}
      />
    </Drawer>
  );
}
