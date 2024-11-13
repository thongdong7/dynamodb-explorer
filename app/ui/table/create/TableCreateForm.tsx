"use client";

import { App, Button, Form, Input } from "antd";
import FormAction from "../../form/FormAction";
import { createTableAPI } from "@/app/lib/actions/tables/create";
import SelectAttrType from "./SelectAttrType";

export default function TableCreateForm() {
  const { message } = App.useApp();
  return (
    <div>
      <h1 className="text-2xl">Create Table</h1>
      <FormAction
        action={createTableAPI}
        initialValues={{
          TableName: "",
          HashAttrName: "",
          HashAttrType: "S",
          RangeAttrName: "",
          RangeAttrType: "S",
          ReadCapacityUnits: 3,
          WriteCapacityUnits: 3,
        }}
        onSuccess={() => {
          message.success("Table created");
        }}
        render={({ loading }) => (
          <>
            <Form.Item
              name="TableName"
              label="Table Name"
              required
              rules={[
                {
                  required: true,
                  message: "Please input your table name!",
                },
              ]}
            >
              <Input autoFocus />
            </Form.Item>
            <div className="grid grid-cols-2 gap-2">
              <Form.Item
                name="HashAttrName"
                label="Hash Attribute Name"
                required
                rules={[
                  {
                    required: true,
                    message: "Please input your hash attribute name!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="HashAttrType"
                label="Hash Attribute Type"
                required
              >
                <SelectAttrType />
              </Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Form.Item name="RangeAttrName" label="Range Attribute Name">
                <Input />
              </Form.Item>
              <Form.Item name="RangeAttrType" label="Range Attribute Type">
                <SelectAttrType />
              </Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Form.Item
                name="ReadCapacityUnits"
                label="Read Capacity Units"
                required
                rules={[
                  {
                    required: true,
                    message: "Please input your read capacity units!",
                  },
                ]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                name="WriteCapacityUnits"
                label="Write Capacity Units"
                required
              >
                <Input type="number" />
              </Form.Item>
            </div>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Table
              </Button>
            </Form.Item>
          </>
        )}
      />
    </div>
  );
}
