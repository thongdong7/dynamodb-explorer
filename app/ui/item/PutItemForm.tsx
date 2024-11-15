"use client";

import { putItemAPI } from "@/app/lib/actions/item/create";
import { TableDescription } from "@aws-sdk/client-dynamodb";
import { darkTheme } from "@uiw/react-json-view/dark";
import { App, Button, Form, Input } from "antd";
import JSONEditor from "../common/JSONEditor";
import FormAction from "../form/FormAction";
import { getTableInfo, TableInfo } from "@/app/lib/utils/tableUtils";

darkTheme.padding = "4";

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
}: {
  tableName: string;
  table: TableDescription;
}) {
  const tableInfo = getTableInfo(table);
  const { message } = App.useApp();
  return (
    <FormAction
      action={putItemAPI}
      extraValues={{ TableName: tableName }}
      initialValues={{ Item: buildInitItem(tableInfo) }}
      onSuccess={() => {
        message.success(`Item created`);
      }}
      render={() => (
        <>
          <Form.Item>
            <Button type="primary" htmlType="submit">
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
