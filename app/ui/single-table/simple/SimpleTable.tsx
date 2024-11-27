import { MRT_SelectCheckbox } from "mantine-react-table";
import { TableScanHook } from "../../table/view/tableScanHook";
import Cell from "./Cell";
import clsx from "clsx";
import { Checkbox } from "antd";

export default function SimpleTable({
  table: { table },
}: {
  table: TableScanHook;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>{table.options.renderTopToolbarCustomActions?.({ table })}</div>
      <div className="overflow-x-auto">
        <table className="border">
          <thead>
            <tr className="sticky top-0 z-10 bg-green-400 bg-opacity-90">
              {table.getVisibleFlatColumns().map((column, columnIndex) => (
                <th
                  key={column.id}
                  className={clsx("border drop-shadow text-white px-1 py-2")}
                >
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
