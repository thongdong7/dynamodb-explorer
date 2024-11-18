import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { Button, Drawer, Space, Tabs } from "antd";
import JsonView from "@uiw/react-json-view";
import { darkTheme } from "@uiw/react-json-view/dark";
import MyJsonViewer from "../../common/MyJsonViewer";
import { TableInfo, tableInfoKeyQueryString } from "@/app/lib/utils/tableUtils";
import { EditOutlined } from "@ant-design/icons";

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
}: {
  item?: Record<string, AttributeValue>;
  onClose: () => void;
  open: boolean;
  tableInfo: TableInfo;
}) {
  if (!item) {
    return null;
  }

  const formattedItem = formatItem(item);

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
        </Space>
      }
    >
      <Tabs
        defaultActiveKey="raw"
        items={[
          {
            key: "raw",
            label: "Raw",
            children: <MyJsonViewer value={item} />,
          },
          {
            key: "formatted",
            label: "Formatted",
            children: <MyJsonViewer value={formattedItem} />,
          },
        ]}
      />
    </Drawer>
  );
}
