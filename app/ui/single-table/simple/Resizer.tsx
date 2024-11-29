import clsx from "clsx";
import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";

export function Resizer({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (newValue: boolean) => void;
}) {
  return (
    <div
      className={clsx(
        "absolute w-4 h-full hidden group-hover:flex justify-center group-hover:bg-gray-500 group-hover:opacity-30 right-0 top-0 bottom-0 cursor-pointer",
      )}
      title={`Click to ${value ? "expand" : "collapse"}`}
      onClick={() => onChange(!value)}
    >
      {value ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
    </div>
  );
}
