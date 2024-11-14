"use client";
import { App, Button, ButtonProps, Popconfirm } from "antd";
import { ClearOutlined } from "@ant-design/icons";
import { purgeTablesAPI } from "@/app/lib/actions/tables/purge";
import { useAction } from "@/app/lib/hook/action";

export default function PurgeTableButton({
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
    run: _purgeTables,
  } = useAction({
    action: purgeTablesAPI,
    onSuccess: () => {
      message.success(`Table ${table} purged`);
      onSuccess && onSuccess();
    },
  });
  return (
    <Popconfirm
      title={
        <div>
          Are you sure you want to purge table <b>{table}</b>?
        </div>
      }
      okText="Yes"
      cancelText="No"
      onConfirm={() => {
        _purgeTables({ tables: [table] });
      }}
    >
      <Button type={type} icon={<ClearOutlined />} loading={loading}>
        Purge
      </Button>
    </Popconfirm>
  );
}
