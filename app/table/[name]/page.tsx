import { describeTable } from "@/app/lib/actions/tables/describe";
import {
  queryDocTable,
  queryTable,
  scanDocTable,
  scanTable,
} from "@/app/lib/actions/tables/list";
import { createPage } from "@/app/lib/utils/createPageUtils";
import PageHeading from "@/app/ui/common/PageHeading";
import PurgeTableButton from "@/app/ui/home/PurgeTableButton";
import TableInfoButton from "@/app/ui/table/info/TableInfoButton";
import Example from "@/app/ui/table/view/Example";
import TableScan from "@/app/ui/table/view/TableScan";
import TableViewDeleteTableButton from "@/app/ui/table/view/TableViewDeleteTableButton";
import { PlusOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Space } from "antd";
import { notFound } from "next/navigation";
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
          ? queryDocTable(name, {
              IndexName: indexName,
              KeyConditionExpression: `${pkField} = :pk`,
              ExpressionAttributeValues: {
                ":pk": pkValue,
              },
              Limit: limit,
              ExclusiveStartKey: startKey ? JSON.parse(startKey) : undefined,
            })
          : scanDocTable(name, {
              Limit: limit,
              ExclusiveStartKey: startKey ? JSON.parse(startKey) : undefined,
            });
      const [table, data] = await Promise.all([describeTable(name), dataFn]);

      if (!table) {
        notFound();
      }

      return (
        <div className="flex flex-col gap-2 ">
          <Breadcrumb items={[{ title: "Home", href: "/" }, { title: name }]} />
          <div className="flex justify-between items-center">
            <PageHeading value={name} />
            <Space>
              <TableInfoButton table={table} />

              <PurgeTableButton type="default" table={name} />
              <TableViewDeleteTableButton table={name} />
            </Space>
          </div>
          {/* <Example /> */}
          <TableScan table={table} data={data} />
        </div>
      );
    },
  );
