import { redirect } from "next/navigation";

/** Contact = ancre homepage — pas de page indexable séparée */
export default function LegacyContactRedirect() {
  redirect("/#contact");
}
