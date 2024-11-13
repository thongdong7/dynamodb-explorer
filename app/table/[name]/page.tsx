import { describeTable } from "@/app/lib/actions/tables/describe";
import { queryTable, scanTable } from "@/app/lib/actions/tables/list";
import { createPage } from "@/app/lib/utils/createPageUtils";
import TableScan from "@/app/ui/table/list/TableScan";
import { Breadcrumb, Button } from "antd";
import { z } from "zod";
import { PlusOutlined } from "@ant-design/icons";

export default createPage()
  .schema(
    z.object({
      params: z.object({
        name: z.string(),
      }),
      searchParams: z.object({
        limit: z.coerce.number().optional().default(25),
        startKey: z.string().optional(),
        indexName: z.string().optional(),
        pkField: z.string().optional(),
        pkValue: z.string().optional(),
      }),
    }),
  )
  .render(
    async ({
      values: {
        params: { name },
        searchParams: { limit, startKey, indexName, pkField, pkValue },
      },
    }) => {
      const dataFn =
        pkField && pkValue
          ? queryTable(name, {
              IndexName: indexName,
              KeyConditionExpression: `${pkField} = :pk`,
              ExpressionAttributeValues: {
                ":pk": { S: pkValue },
              },
              Limit: limit,
              ExclusiveStartKey: startKey ? JSON.parse(startKey) : undefined,
            })
          : scanTable(name, {
              Limit: limit,
              ExclusiveStartKey: startKey ? JSON.parse(startKey) : undefined,
            });
      const [table, data] = await Promise.all([describeTable(name), dataFn]);

      return (
        <div>
          <div className="flex justify-between items-center">
            <Breadcrumb
              items={[{ title: "Home", href: "/" }, { title: name }]}
            />
            <div>
              <Button
                type="primary"
                href="/table/[name]/create"
                icon={<PlusOutlined />}
              >
                Create Item
              </Button>
            </div>
          </div>
          <TableScan table={table} data={data} />
        </div>
      );
    },
  );
