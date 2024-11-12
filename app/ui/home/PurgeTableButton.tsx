import { Button } from "antd";
import { ClearOutlined } from "@ant-design/icons";

export default function PurgeTableButton({ table }: { table: string }) {
  return (
    <Button type="text" icon={<ClearOutlined />}>
      Purge
    </Button>
  );
}
