"use client";

import { putItemAPI } from "@/app/lib/actions/item/create";
import { useBackRefresh } from "@/app/lib/hook/backRefresh";
import { getTableInfo, TableInfo } from "@/app/lib/utils/tableUtils";
import { TableDescription } from "@aws-sdk/client-dynamodb";
import { App, Button, Form } from "antd";
import JSONEditor from "../common/JSONEditor";
import FormAction from "../form/FormAction";
import { SaveOutlined } from "@ant-design/icons";

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
  tableName,
  table,
  item,
}: {
  tableName: string;
  table: TableDescription;
  item?: Record<string, any>;
}) {
  const tableInfo = getTableInfo(table);
  const { message } = App.useApp();
  const backRefresh = useBackRefresh();
  return (
    <FormAction
      action={putItemAPI}
      extraValues={{ TableName: tableName }}
      initialValues={{ Item: item ? item : buildInitItem(tableInfo) }}
      onSuccess={() => {
        message.success(`Item ${item ? "updated" : "created"} successfully`);

        backRefresh();
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
