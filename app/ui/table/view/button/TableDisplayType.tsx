"use client";

import { Segmented } from "antd";
import { TableOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useState } from "react";

type DisplayType = "Simple" | "Resizable";

export function useTableDisplayType() {
  const [displayType, setDisplayType] = useState<DisplayType>("Simple");

  return {
    value: displayType,
    onChange: (value: DisplayType) => {
      setDisplayType(value);
    },
  };
}

export default function TableDisplayType({
  value,
  onChange,
}: {
  value: DisplayType;
  onChange: (value: DisplayType) => void;
}) {
  return (
    <Segmented
      value={value}
      onChange={onChange}
      options={[
        { value: "Simple", icon: <UnorderedListOutlined /> },
        { value: "Resizable", icon: <TableOutlined /> },
      ]}
    />
  );
}
