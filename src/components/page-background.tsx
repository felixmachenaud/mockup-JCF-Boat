import {
  HERO_COLOR,
  HERO_DESKTOP,
  HERO_LQIP,
  HERO_MOBILE,
} from "@/lib/hero-assets";

export function PageBackground() {
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 -z-10 w-full"
      style={{
        top: "-80px",
        height: "calc(100lvh + 160px)",
        backgroundColor: HERO_COLOR,
        backgroundImage: `url(${HERO_LQIP})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet={HERO_MOBILE}
          type="image/jpeg"
        />
        <img
          src={HERO_DESKTOP}
          alt=""
          width={2048}
          height={1152}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </picture>
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}
