import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { Drawer, Tabs } from "antd";
import JsonView from "@uiw/react-json-view";
import { darkTheme } from "@uiw/react-json-view/dark";

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
}: {
  item?: Record<string, AttributeValue>;
  onClose: () => void;
  open: boolean;
}) {
  if (!item) {
    return null;
  }

  return (
    <Drawer onClose={onClose} open={open} size="large">
      <Tabs
        defaultActiveKey="raw"
        items={[
          {
            key: "raw",
            label: "Raw",
            children: (
              <JsonView
                value={item}
                displayDataTypes={false}
                displayObjectSize={false}
                style={darkTheme}
                shortenTextAfterLength={0}
              />
            ),
          },
          {
            key: "formatted",
            label: "Formatted",
            children: (
              <JsonView
                value={formatItem(item)}
                displayDataTypes={false}
                displayObjectSize={false}
                style={darkTheme}
                shortenTextAfterLength={0}
              />
            ),
          },
        ]}
      />
    </Drawer>
  );
}
