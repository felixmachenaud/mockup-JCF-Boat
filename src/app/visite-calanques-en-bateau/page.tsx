import { redirect } from "next/navigation";

/** Ancienne URL guide → page canonique Calanques */
export default function LegacyGuideRedirect() {
  redirect("/calanques-de-cassis");
}
