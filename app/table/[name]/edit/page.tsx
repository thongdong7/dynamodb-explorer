import { getItem } from "@/app/lib/actions/item/get";
import { createPage } from "@/app/lib/utils/createPageUtils";
import PageHeading from "@/app/ui/common/PageHeading";
import PutItemForm from "@/app/ui/item/PutItemForm";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import zu from "zod_utilz";

export default createPage()
  .schema(
    z.object({
      params: z.object({
        name: z.string(),
      }),
      searchParams: zu.json(),
    }),
  )
  .render(
    async ({
      values: {
        params: { name },
        searchParams,
      },
    }) => {
      if (searchParams == null) {
        notFound();
      }

      const { item, table } = await getItem(
        name,
        searchParams as Record<string, any>,
      );
      return (
        <div className="container-focus">
          <Breadcrumb
            items={[
              { title: "Home", href: "/" },
              { title: <Link href={`/table/${name}`}>{name}</Link> },
              { title: "Edit item" },
            ]}
          />
          <PageHeading value="Edit item" />
          <PutItemForm tableName={name} table={table} item={item} />
        </div>
      );
    },
  );
