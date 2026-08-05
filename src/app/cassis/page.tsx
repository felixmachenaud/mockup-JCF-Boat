import { redirect } from "next/navigation";

/** Ancienne URL → page canonique Calanques */
export default function LegacyCassisRedirect() {
  redirect("/calanques-de-cassis");
}
