"use client";

import { useNav } from "@/app/lib/hook/nav";
import { Segmented } from "antd";

export default function IndexSelector({ names }: { names: string[] }) {
  const { changeParams, searchParams } = useNav();

  return (
    <Segmented
      options={[
        {
          label: "Base",
          value: "",
        },
        ...names.map((name) => ({ label: name, value: name })),
      ]}
      value={searchParams.get("indexName") ?? ""}
      onChange={(value) => {
        const indexName = value === "" ? undefined : value;
        changeParams({ indexName, pkField: undefined, pkValue: undefined });
      }}
    />
  );
}
