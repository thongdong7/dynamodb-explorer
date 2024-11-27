import { Checkbox } from "antd";
import clsx from "clsx";
import {
  MRT_Cell,
  MRT_TableBodyCellValue,
  MRT_TableInstance,
} from "mantine-react-table";
import { ReactNode } from "react";

export const parseFromValuesOrFunc = <T, U>(
  fn: ((arg: U) => T) | T | undefined,
  arg: U,
): T | undefined => (fn instanceof Function ? fn(arg) : fn);

export default function Cell<T extends Record<string, any>>({
  cell,
  table,
  renderedColumnIndex,
}: {
  cell: MRT_Cell<T>;
  table: MRT_TableInstance<T>;
  renderedColumnIndex: number;
}) {
  const { row, column } = cell;
  const args = {
    cell,
    column,
    row,
    renderedColumnIndex,
    // renderedRowIndex,
    // row,
    table,
  };

  const { sx, ...cellProps } =
    parseFromValuesOrFunc(
      cell.column.columnDef.mantineTableBodyCellProps,
      args,
    ) ?? {};
  if (cellProps.rowSpan === 0) {
    return null;
  }

  //   if (renderedColumnIndex === 1) {
  //     console.log(table.getState().rowSelection, row.id);
  //   }

  return (
    <td
      key={cell.id}
      className={clsx("border", {
        "px-1": column.columnDef.header !== "Attributes",
        "p-0": column.columnDef.header === "Attributes",
        "text-nowrap": renderedColumnIndex <= 1,
      })}
      //   style={sx as any}
      {...cellProps}
    >
      {renderedColumnIndex !== 1 ? (
        <MRT_TableBodyCellValue cell={cell} table={table} />
      ) : (
        <Checkbox
          checked={table.getState().rowSelection[row.id]}
          onChange={(e) =>
            table.setRowSelection((prev) => ({
              ...prev,
              [row.id]: e.target.checked,
            }))
          }
        />
      )}
    </td>
  );
}
