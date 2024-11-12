"use client";

import { ListTablesResult } from "@/app/lib/actions/tables/describe";
import { Button, Space, Table } from "antd";
import PurgeTableButton from "./PurgeTableButton";

export default function Home({ data }: { data: ListTablesResult }) {
  return (
    <div>
      <Table
        dataSource={data.tables}
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
                <PurgeTableButton table={record.Table?.TableName!} />
                <Button type="text" danger>
                  Delete
                </Button>
              </Space>
            ),
          },
        ]}
      />
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
}
