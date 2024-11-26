"use client";

import { putItemAPI } from "@/app/lib/actions/item/create";
import { TableInfo } from "@/app/lib/utils/tableUtils";
import { SaveOutlined } from "@ant-design/icons";
import { App, Button, Form } from "antd";
import JSONEditor from "../common/JSONEditor";
import FormAction from "../form/FormAction";

function typeToInitValue(type: "S" | "N" | "B" | undefined) {
  switch (type) {
    case "S":
      return "";
    case "N":
      return 0;
    case "B":
      return "";
    default:
      return "";
  }
}

function buildInitItem(tableInfo: TableInfo) {
  const item: Record<string, any> = {};
  item[tableInfo.pk] = typeToInitValue(tableInfo.pkType);
  if (tableInfo.sk) {
    item[tableInfo.sk] = typeToInitValue(tableInfo.skType);
  }
  return item;
}

export default function PutItemForm({
  tableInfo,
  item,
  onSuccess,
}: {
  tableInfo: TableInfo;
  item?: Record<string, any>;
  onSuccess?: (values: Record<string, any>) => void;
}) {
  const { message } = App.useApp();
  return (
    <FormAction
      action={putItemAPI}
      extraValues={{ TableName: tableInfo.name }}
      initialValues={{ Item: item ? item : buildInitItem(tableInfo) }}
      onSuccess={(data, values) => {
        message.success(`Item ${item ? "updated" : "created"} successfully`);

        onSuccess && onSuccess(values.Item);
      }}
      render={() => (
        <>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save
            </Button>
          </Form.Item>
          <Form.Item name="Item" required>
            <JSONEditor />
          </Form.Item>
        </>
      )}
    />
  );
}
