"use client";
import { useBackRefresh } from "@/app/lib/hook/backRefresh";
import DeleteTableButton from "../../home/DeleteTableButton";

export default function TableViewDeleteTableButton({
  table,
}: {
  table: string;
}) {
  const backRefresh = useBackRefresh();
  return (
    <DeleteTableButton
      table={table}
      type="default"
      onSuccess={() => {
        backRefresh();
      }}
    />
  );
}
