"use client";

import { ListTablesResult } from "@/app/lib/actions/tables/describe";
import { App, Button, Popconfirm, Space, Table } from "antd";
import PurgeTableButton from "./PurgeTableButton";
import { useRouter } from "next/navigation";
import DeleteTableButton from "./DeleteTableButton";
import { Key, useState } from "react";
import { ClearOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { deleteTablesAPI } from "@/app/lib/actions/tables/delete";
import { useAction } from "@/app/lib/hook/action";
import { purgeTablesAPI } from "@/app/lib/actions/tables/purge";

export default function Home({ data }: { data: ListTablesResult }) {
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const { message } = App.useApp();
  const { loading: deleting, run: _deleteTables } = useAction({
    action: deleteTablesAPI,
    onSuccess: () => {
      message.success(`Tables deleted`);
      setSelectedRowKeys([]);
      router.refresh();
    },
  });
  const { loading: purging, run: _purgeTables } = useAction({
    action: purgeTablesAPI,
    onSuccess: () => {
      message.success(`Tables purged`);
      setSelectedRowKeys([]);
      router.refresh();
    },
  });
  return (
    <div className="container-focus">
      <div className="flex justify-between items-center">
        <h1>Tables</h1>
        <Space>
          <Button
            type="primary"
            onClick={() => {
              router.push("/table/create");
            }}
            icon={<PlusOutlined />}
          >
            Create Table
          </Button>
          <Popconfirm
            title={
              <div>
                Are you sure to purge <b>{selectedRowKeys.length}</b> tables?
              </div>
            }
            okText="Yes"
            cancelText="No"
            onConfirm={() => {
              _purgeTables({ tables: selectedRowKeys as string[] });
            }}
          >
            <Button
              loading={purging}
              disabled={selectedRowKeys.length === 0}
              icon={<ClearOutlined />}
            >
              Purge
            </Button>
          </Popconfirm>
          <Popconfirm
            title={
              <div>
                Are you sure to delete <b>{selectedRowKeys.length}</b> tables?
              </div>
            }
            okText="Yes"
            cancelText="No"
            onConfirm={() => {
              _deleteTables({ tables: selectedRowKeys as string[] });
            }}
          >
            <Button
              danger
              disabled={selectedRowKeys.length === 0}
              loading={deleting}
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      </div>
      <Table
        dataSource={data.tables}
        size="small"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={[
          {
            title: "Name",
            dataIndex: ["Table", "TableName"],
            render: (name: string) => <a href={`/table/${name}`}>{name}</a>,
          },
          {
            title: "Item Count",
            dataIndex: ["Table", "ItemCount"],
          },
          {
            title: "Size (Bytes)",
            dataIndex: ["Table", "TableSizeBytes"],
          },
          {
            title: "Status",
            dataIndex: ["Table", "TableStatus"],
          },
          {
            title: "Actions",
            render: (value, record) => (
              <Space>
                <PurgeTableButton
                  table={record.Table?.TableName!}
                  onSuccess={() => router.refresh()}
                />
                <DeleteTableButton
                  table={record.Table?.TableName!}
                  onSuccess={() => router.refresh()}
                />
              </Space>
            ),
          },
        ]}
        rowKey={(record) => record.Table?.TableName!}
      />
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
}
