import { Select } from "antd";

export default function SelectAttrType({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Select
      value={value}
      options={[
        { label: "String", value: "S" },
        { label: "Number", value: "N" },
        { label: "Binary", value: "B" },
      ]}
      onChange={onChange}
    />
  );
}
