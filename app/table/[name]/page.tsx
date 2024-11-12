import { describeTable } from "@/app/lib/actions/tables/describe";
import { scanTable } from "@/app/lib/actions/tables/list";
import { createPage } from "@/app/lib/utils/createPageUtils";
import TableScan from "@/app/ui/table/TableScan";
import { Breadcrumb } from "antd";
import { values } from "lodash";
import { z } from "zod";

// export default async function Page({
//   params: { name },
// }: {
//   params: { name: string };
// }) {
//   const [table, data] = await Promise.all([
//     describeTable(name),
//     scanTable(name),
//   ]);

//   return (
//     <div>
//       <Breadcrumb items={[{ title: "Home", href: "/" }, { title: name }]} />
//       <TableScan table={table} data={data} />
//     </div>
//   );
// }

export default createPage()
  .schema(
    z.object({
      params: z.object({
        name: z.string(),
      }),
      searchParams: z.object({
        limit: z.coerce.number().optional().default(10),
        startKey: z.string().optional(),
      }),
    }),
  )
  .render(
    async ({
      values: {
        params: { name },
        searchParams: { limit, startKey },
      },
    }) => {
      const [table, data] = await Promise.all([
        describeTable(name),
        scanTable(name, {
          Limit: limit,
          ExclusiveStartKey: startKey ? JSON.parse(startKey) : undefined,
        }),
      ]);

      return (
        <div>
          <Breadcrumb items={[{ title: "Home", href: "/" }, { title: name }]} />
          <TableScan table={table} data={data} />
        </div>
      );
    },
  );
