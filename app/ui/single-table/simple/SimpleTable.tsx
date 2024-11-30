import { TableInfo } from "@/app/lib/utils/tableUtils";
import { Checkbox } from "antd";
import clsx from "clsx";
import { TableScanHook } from "../../table/view/tableScanHook";
import Cell from "./Cell";
import { Resizer } from "./Resizer";
import { useSimpleTable } from "./simpleTableHook";

export default function SimpleTable({
  table: { table },
  tableInfo,
}: {
  table: TableScanHook;
  tableInfo: TableInfo;
}) {
  const simpleTable = useSimpleTable({ tableInfo });

  return (
    <div className="flex flex-col gap-2">
      <div>{table.options.renderTopToolbarCustomActions?.({ table })}</div>
      <div className="overflow-x-auto h-[calc(100vh-220px)]">
        <table className="border">
          <thead>
            <tr className="sticky top-0 z-10 bg-green-400 border-t drop-shadow">
              {table.getVisibleFlatColumns().map((column, columnIndex) => (
                <th
                  key={column.id}
                  className={clsx("border text-white px-1 py-2 relative group")}
                >
                  {simpleTable.isSupportCollapsed(column.id) && (
                    <Resizer
                      value={simpleTable.isCollapsed(column.id)}
                      onChange={(value) =>
                        simpleTable.setCollapse(column.id, value)
                      }
                    />
                  )}
                  {columnIndex === 1 ? (
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected()}
                      indeterminate={
                        table.getIsSomePageRowsSelected() &&
                        !table.getIsAllPageRowsSelected()
                      }
                      onChange={(e) =>
                        table.toggleAllRowsSelected(e.target.checked)
                      }
                    />
                  ) : column.columnDef.header instanceof Function ? (
                    // @ts-expect-error
                    column.columnDef.header({ column, table })
                  ) : (
                    column.columnDef.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell, renderedColumnIndex) => (
                  <Cell
                    key={cell.id}
                    cell={cell}
                    table={table}
                    renderedColumnIndex={renderedColumnIndex}
                    simpleTable={simpleTable}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
