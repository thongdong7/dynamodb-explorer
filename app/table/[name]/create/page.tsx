import { describeTable } from "@/app/lib/actions/tables/describe";
import { createPage } from "@/app/lib/utils/createPageUtils";
import PutItemForm from "@/app/ui/item/PutItemForm";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

export default createPage()
  .schema(
    z.object({
      params: z.object({
        name: z.string(),
      }),
    }),
  )
  .render(
    async ({
      values: {
        params: { name },
      },
    }) => {
      const table = await describeTable(name);
      if (!table) {
        notFound();
      }

      return (
        <div className="container-focus">
          <Breadcrumb
            items={[
              { title: "Home", href: "/" },
              { title: <Link href={`/table/${name}`}>{name}</Link> },
              { title: "Create item" },
            ]}
          />
          <h1 className="text-xl">Create item</h1>
          <PutItemForm tableName={name} table={table} />
        </div>
      );
    },
  );
