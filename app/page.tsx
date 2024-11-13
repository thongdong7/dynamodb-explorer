import { listAllTables } from "./lib/actions/tables/describe";
import Home from "./ui/home/Home";

export default async function Page() {
  const data = await listAllTables();

  return <Home data={data} />;
}
