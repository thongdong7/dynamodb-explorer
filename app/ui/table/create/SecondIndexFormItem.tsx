import { Card, Form, FormListFieldData, Input, Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import SelectAttrType from "./SelectAttrType";

export default function SecondIndexFormItem({
  field,
}: {
  field: FormListFieldData;
}) {
  console.log(field);
  return (
    <div>
      <Card
        size="small"
        title={`Secondary Index ${field.name + 1}`}
        key={field.key}
      >
        <div className="grid grid-cols-2 gap-2">
          <Form.Item
            label="Index Name"
            name={[field.name, "name"]}
            required
            rules={[
              {
                required: true,
                message: "Please input your index name!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Index Type" name={[field.name, "type"]}>
            <Select
              options={[
                { label: "Global Secondary Index (GSI)", value: "GSI" },
                { label: "Local Secondary Index (LSI)", value: "LSI" },
              ]}
            />
          </Form.Item>
        </div>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.indexes[field.name].type !==
            currentValues.indexes[field.name].type
          }
        >
          {({ getFieldValue }) =>
            getFieldValue(["indexes", field.name, "type"]) === "GSI" ? (
              <div className="grid grid-cols-2 gap-2">
                <Form.Item
                  name={[field.name, "HashAttrName"]}
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
                  name={[field.name, "HashAttrType"]}
                  label="Hash Attribute Type"
                  required
                >
                  <SelectAttrType />
                </Form.Item>
              </div>
            ) : null
          }
        </Form.Item>
        <div className="grid grid-cols-2 gap-2">
          <Form.Item
            name={[field.name, "RangeAttrName"]}
            label="Range Attribute Name"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={[field.name, "RangeAttrType"]}
            label="Range Attribute Type"
          >
            <SelectAttrType />
          </Form.Item>
        </div>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.indexes[field.name].type !==
            currentValues.indexes[field.name].type
          }
        >
          {({ getFieldValue }) =>
            getFieldValue(["indexes", field.name, "type"]) === "GSI" ? (
              <div className="grid grid-cols-2 gap-2">
                <Form.Item
                  name={[field.name, "ReadCapacityUnits"]}
                  label="Read Capacity Units"
                  required
                  rules={[
                    {
                      required: true,
                      message: "Please input your read capacity units!",
                    },
                  ]}
                >
                  <Input
                    type="number"
                    disabled={
                      getFieldValue(["indexes", field.name, "type"]) !== "GSI"
                    }
                  />
                </Form.Item>

                <Form.Item
                  name={[field.name, "WriteCapacityUnits"]}
                  label="Write Capacity Units"
                  required
                >
                  <Input
                    type="number"
                    disabled={
                      getFieldValue(["indexes", field.name, "type"]) !== "GSI"
                    }
                  />
                </Form.Item>
              </div>
            ) : null
          }
        </Form.Item>
      </Card>
    </div>
  );
}
