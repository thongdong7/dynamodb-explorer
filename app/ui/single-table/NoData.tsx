import { RobotOutlined } from "@ant-design/icons";

export default function NoData() {
  return (
    <>
      <div>
        <RobotOutlined style={{ fontSize: 48 }} />
      </div>
      <div className="mt-4">No data</div>
    </>
  );
}
