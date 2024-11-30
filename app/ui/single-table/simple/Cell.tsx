import { Checkbox } from "antd";
import clsx from "clsx";
import {
  MRT_Cell,
  MRT_TableBodyCellValue,
  MRT_TableInstance,
} from "mantine-react-table";
import { Resizer } from "./Resizer";
import { SimpleTableHook } from "./simpleTableHook";

export const parseFromValuesOrFunc = <T, U>(
  fn: ((arg: U) => T) | T | undefined,
  arg: U,
): T | undefined => (fn instanceof Function ? fn(arg) : fn);

export default function Cell<T extends Record<string, any>>({
  cell,
  table,
  renderedColumnIndex,
  simpleTable,
}: {
  cell: MRT_Cell<T>;
  table: MRT_TableInstance<T>;
  renderedColumnIndex: number;
  simpleTable: SimpleTableHook;
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

  return (
    <td
      key={cell.id}
      className={clsx("border relative group", {
        "px-1": column.columnDef.header !== "Attributes",
        "p-0 w-full": column.columnDef.header === "Attributes",
        "text-nowrap w-0": renderedColumnIndex <= 1,
        // "w-32 text-ellipsis overflow-hidden": collapse,
      })}
      // style={sx as any}
      {...cellProps}
    >
      {renderedColumnIndex !== 1 ? (
        <div
          className={clsx({
            "max-w-44 text-ellipsis overflow-hidden":
              renderedColumnIndex > 1 && simpleTable.isCollapsed(column.id),
          })}
        >
          {simpleTable.isSupportCollapsed(column.id) && (
            <Resizer
              value={simpleTable.isCollapsed(column.id)}
              onChange={(value) => simpleTable.setCollapse(column.id, value)}
            />
          )}
          <MRT_TableBodyCellValue cell={cell} table={table} />
        </div>
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
