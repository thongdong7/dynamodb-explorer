import { ColumnType, TableProps } from "antd/es/table";
import clsx from "clsx";
import { ReactNode } from "react";

export type Column<RecordType> = ColumnType<RecordType> & {
  freeze?: boolean;
  noWrap?: boolean;
};

export default function Table<RecordType>({
  columns,
  dataSource,
  onRow,
}: {
  columns: Column<RecordType>[];
  dataSource?: RecordType[];
  onRow?: TableProps<RecordType>["onRow"];
}) {
  return (
    <table className="border-collapse min-w-full text-sm">
      <thead className="bg-slate-100 sticky top-0 z-10">
        <tr>
          {columns.map(({ title, freeze, hidden }, i) => (
            <th
              key={i}
              className={clsx("border-b p-2 text-slate-400 text-left", {
                "sticky left-0 bg-gray-200": freeze,
                hidden: hidden,
              })}
            >
              {title as ReactNode}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white">
        {dataSource === undefined ? (
          <div>No data</div>
        ) : (
          dataSource.map((item, i) => (
            <tr
              key={i}
              className={clsx("hover:bg-slate-50 group", {
                "cursor-pointer": Boolean(onRow?.(item, i).onClick),
              })}
              onClick={(e) => onRow?.(item, i).onClick?.(e)}
            >
              {columns.map((column, j) => {
                return (
                  <td
                    key={j}
                    className={clsx(
                      "border-b border-slate-100 1truncate 1max-w-28 px-2",
                      {
                        "sticky bg-gray-200 group-hover:bg-gray-100":
                          column.freeze,
                        "left-0": column.freeze,
                        "whitespace-nowrap": column.noWrap,
                        hidden: column.hidden,
                      },
                    )}
                  >
                    <ColumnContent column={column} record={item} index={i} />
                  </td>
                );
              })}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function ColumnContent<RecordType>({
  column,
  record,
  index,
}: {
  column: Column<RecordType>;
  record: RecordType;
  index: number;
}) {
  const { dataIndex, render } = column;
  // @ts-expect-error
  const value = dataIndex ? record[dataIndex] : record;
  if (render) {
    return render(value, record, index) as ReactNode;
  }

  return value;
}
