import { ColumnType, TableProps } from "antd/es/table";
import clsx from "clsx";
import { ReactNode, useRef } from "react";
import NoData from "./NoData";

export type Column<RecordType> = ColumnType<RecordType> & {
  freeze?: boolean;
  noWrap?: boolean;
};

export default function SingleTable<RecordType>({
  columns,
  dataSource,
  onRow,
}: {
  columns: Column<RecordType>[];
  dataSource?: RecordType[];
  onRow?: TableProps<RecordType>["onRow"];
}) {
  const freezeColumnsRef = useRef<HTMLTableCellElement[]>([]);

  return (
    <div>
      <table className="border-collapse min-w-full text-sm">
        <thead className="drop-shadow bg-slate-100 sticky top-0 z-10">
          <tr>
            {columns.map(({ title, freeze, hidden }, i) => (
              <th
                key={i}
                ref={(el) => {
                  if (freeze && freezeColumnsRef.current && el) {
                    freezeColumnsRef.current[i] = el;
                  }
                }}
                className={clsx("p-2 text-slate-900 text-left", {
                  "sticky bg-gray-200 z-10": freeze,
                  hidden: hidden,
                  "left-0": freeze && i === 0,
                })}
                style={{
                  left: freeze
                    ? freezeColumnsRef.current
                        .slice(0, i)
                        .reduce((acc, el) => acc + el.offsetWidth, 0)
                    : undefined,
                }}
              >
                {title as ReactNode}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {dataSource === undefined || dataSource.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center p-4 text-gray-500"
              >
                <NoData />
              </td>
            </tr>
          ) : (
            dataSource.map((item, i) => (
              <tr
                key={i}
                className={clsx("hover:bg-slate-50 group", {
                  "cursor-pointer": Boolean(onRow?.(item, i).onClick),
                })}
                onClick={(e) => onRow?.(item, i).onClick?.(e)}
              >
                {columns.map(({ freeze, ...column }, j) => {
                  return (
                    <td
                      key={j}
                      className={clsx(
                        "border-b border-slate-100 1truncate 1max-w-28 px-2",
                        {
                          "sticky bg-gray-200 group-hover:bg-gray-100": freeze,
                          "left-0": freeze && j === 0,
                          "whitespace-nowrap": column.noWrap,
                          hidden: column.hidden,
                        },
                      )}
                      style={{
                        left: freeze
                          ? freezeColumnsRef.current
                              .slice(0, j)
                              .reduce((acc, el) => acc + el.offsetWidth, 0)
                          : undefined,
                      }}
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
    </div>
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
