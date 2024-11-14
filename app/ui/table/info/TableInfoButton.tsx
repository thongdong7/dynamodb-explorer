"use client";

import { Button, Drawer } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { DescribeTableCommandOutput } from "@aws-sdk/client-dynamodb";
import { useOpen } from "@/app/lib/hook/open";
import MyJsonViewer from "../../common/MyJsonViewer";

export default function TableInfoButton({
  table,
}: {
  table: DescribeTableCommandOutput;
}) {
  const drawerState = useOpen();
  return (
    <>
      <Button
        type="text"
        icon={<InfoCircleOutlined />}
        onClick={drawerState.onOpen}
      />
      <Drawer
        title="Table Info"
        size="large"
        open={drawerState.open}
        onClose={drawerState.onClose}
        classNames={{
          body: "bg-gray-950",
        }}
      >
        <MyJsonViewer value={table.Table} />
      </Drawer>
    </>
  );
}
