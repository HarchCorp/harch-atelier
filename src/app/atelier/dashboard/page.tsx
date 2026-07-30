import { redirect } from "next/navigation";

// Old /atelier/dashboard route → redirect to /atelier/console
export default function Page() {
  redirect("/atelier/console");
}
