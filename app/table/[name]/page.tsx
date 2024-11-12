import { describeTable } from "@/app/lib/actions/tables/describe";
import { scanTable } from "@/app/lib/actions/tables/list";
import TableScan from "@/app/ui/table/TableScan";
import { Breadcrumb } from "antd";

export default async function Page({
  params: { name },
}: {
  params: { name: string };
}) {
  const [table, data] = await Promise.all([
    describeTable(name),
    scanTable(name),
  ]);

  return (
    <div>
      <Breadcrumb items={[{ title: "Home", href: "/" }, { title: name }]} />
      <TableScan table={table} data={data} />
    </div>
  );
}
