import { createPage } from "@/app/lib/utils/createPageUtils";
import TableCreateForm from "@/app/ui/table/create/TableCreateForm";
import { Breadcrumb } from "antd";

export default createPage().render(async () => {
  return (
    <div className="container-focus">
      <Breadcrumb
        items={[{ title: "Home", href: "/" }, { title: "Create Table" }]}
      />
      <TableCreateForm />
    </div>
  );
});
