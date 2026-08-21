import Image from "next/image";

export function PageBackground() {
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 -z-10 w-full"
      style={{
        top: "-80px",
        height: "calc(100lvh + 160px)",
      }}
    >
      <Image
        src="/fond.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}
