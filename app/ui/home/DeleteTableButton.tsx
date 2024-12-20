"use client";
import { App, Button, ButtonProps, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { deleteTablesAPI } from "@/app/lib/actions/tables/delete";
import { useAction } from "@/app/lib/hook/action";

export default function DeleteTableButton({
  table,
  onSuccess,
  type = "text",
}: {
  table: string;
  type?: ButtonProps["type"];
  onSuccess?: () => void;
}) {
  const { message } = App.useApp();
  const {
    loading,
    error,
    run: _deleteTables,
  } = useAction<{ tables: string[] }, void, {}>({
    action: deleteTablesAPI,
    onSuccess: () => {
      message.success(`Table ${table} deleted`);
      onSuccess && onSuccess();
    },
  });
  return (
    <Popconfirm
      title={
        <div>
          Are you sure you want to delete table <b>{table}</b>?
        </div>
      }
      okText="Yes"
      cancelText="No"
      onConfirm={() => {
        _deleteTables({ tables: [table] });
      }}
    >
      <Button danger type={type} icon={<DeleteOutlined />} loading={loading}>
        Delete
      </Button>
    </Popconfirm>
  );
}
