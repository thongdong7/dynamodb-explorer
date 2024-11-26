import { TableInfo } from "@/app/lib/utils/tableUtils";
import { App, Button, Modal } from "antd";
import { useState } from "react";
import PutItemForm from "./PutItemForm";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

export default function CreateItemButton({
  tableInfo,
  onSuccess,
  item,
}: {
  tableInfo: TableInfo;
  onSuccess?: (values: Record<string, any>) => void;
  item?: Record<string, any>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="primary"
        icon={item === undefined ? <PlusOutlined /> : <EditOutlined />}
        onClick={() => setOpen(true)}
      >
        {item === undefined ? "Create" : "Edit"} Item
      </Button>
      <Modal
        title="Create Item"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <PutItemForm
          tableInfo={tableInfo}
          onSuccess={(values) => {
            onSuccess && onSuccess(values);
            setOpen(false);
          }}
          item={item}
        />
      </Modal>
    </>
  );
}
