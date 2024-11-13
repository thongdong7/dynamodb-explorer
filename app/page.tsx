import { listAllTables } from "./lib/actions/tables/describe";
import { createPage } from "./lib/utils/createPageUtils";
import Home from "./ui/home/Home";

export default createPage().render(async () => {
  const data = await listAllTables();

  return <Home data={data} />;
});
