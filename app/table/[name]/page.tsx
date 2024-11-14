import { describeTable } from "@/app/lib/actions/tables/describe";
import { queryTable, scanTable } from "@/app/lib/actions/tables/list";
import { createPage } from "@/app/lib/utils/createPageUtils";
import PurgeTableButton from "@/app/ui/home/PurgeTableButton";
import TableInfoButton from "@/app/ui/table/info/TableInfoButton";
import TableScan from "@/app/ui/table/view/TableScan";
import TableViewDeleteTableButton from "@/app/ui/table/view/TableViewDeleteTableButton";
import { PlusOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Space } from "antd";
import { z } from "zod";

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
        <div className="flex flex-col gap-2">
          <Breadcrumb items={[{ title: "Home", href: "/" }, { title: name }]} />
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">{name}</h1>
            <Space>
              <TableInfoButton table={table} />
              <Button
                type="primary"
                href={`/table/${name}/create`}
                icon={<PlusOutlined />}
              >
                Create Item
              </Button>
              <PurgeTableButton type="default" table={name} />
              <TableViewDeleteTableButton table={name} />
            </Space>
          </div>
          <TableScan table={table} data={data} />
        </div>
      );
    },
  );
