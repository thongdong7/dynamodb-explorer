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
import { humanFileSize } from "@/app/lib/utils/format";
import PageHeading from "../common/PageHeading";

export default function Home({ data }: { data: ListTablesResult }) {
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const { message } = App.useApp();
  const { loading: deleting, run: _deleteTables } = useAction<
    { tables: string[] },
    void,
    {}
  >({
    action: deleteTablesAPI,
    onSuccess: () => {
      message.success(`Tables deleted`);
      setSelectedRowKeys([]);
      router.refresh();
    },
  });
  const { loading: purging, run: _purgeTables } = useAction<
    { tables: string[] },
    void,
    {}
  >({
    action: purgeTablesAPI,
    onSuccess: () => {
      message.success(`Tables purged`);
      setSelectedRowKeys([]);
      router.refresh();
    },
  });
  return (
    <div className="container-focus flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <PageHeading value="Tables" />
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
            dataIndex: ["TableName"],
            render: (name: string) => <a href={`/table/${name}`}>{name}</a>,
          },
          {
            title: "Item Count",
            dataIndex: ["ItemCount"],
            render: (count: number) => count.toLocaleString("en-US"),
            align: "right",
          },
          {
            title: "Size",
            dataIndex: ["TableSizeBytes"],
            render: (size: number) => humanFileSize(size),
            align: "right",
          },
          {
            title: "Status",
            dataIndex: ["TableStatus"],
          },
          {
            title: "Actions",
            render: (value, record) => (
              <Space>
                <PurgeTableButton
                  table={record.TableName!}
                  onSuccess={() => router.refresh()}
                />
                <DeleteTableButton
                  table={record.TableName!}
                  onSuccess={() => router.refresh()}
                />
              </Space>
            ),
          },
        ]}
        rowKey={(record) => record.TableName!}
      />
    </div>
  );
}
