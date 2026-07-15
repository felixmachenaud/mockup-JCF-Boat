import Image from "next/image";

export function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Image
        src="/fond.jpg"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}
