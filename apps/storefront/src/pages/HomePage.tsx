import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { DesignAssetDto } from "@d-shirtak/shared";
import { Container } from "../components/ui/Container";
import { LinkButton } from "../components/ui/LinkButton";
import { ProductCard } from "../components/ProductCard";
import { Reveal } from "../components/ui/Reveal";
import { ShirtMark, Sparkle } from "../components/ui/ShirtMark";
import { useDesignAssets, useProducts } from "../features/catalog/catalog-api";

const marqueeWords = ["YOUR ART HERE", "NO MINIMUMS", "CASH ON DELIVERY", "BE YOUR OWN DESIGNER"];

const steps = [
  { n: "01", title: "Upload or draw", body: "Bring a file, or build it with text and the design library — no software to learn." },
  { n: "02", title: "See it live", body: "Swap garment color, flip front to back, check exactly where the print box sits." },
  { n: "03", title: "We print, you wear", body: "Confirm the mockup, checkout with cash on delivery, and we get to work.", accent: true },
];

function DesignInspirationCard({ asset }: { asset: DesignAssetDto }) {
  // Slide 0 is always the flat print; every model shot the admin has added follows it. Cycles
  // through all of them automatically -- no click needed to see the design worn.
  const slides = [
    { key: "print", url: asset.imageUrl, isModel: false },
    ...asset.modelShots.map((shot) => ({ key: shot.id, url: shot.imageUrl, isModel: true })),
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setActiveIndex((i) => (i + 1) % slides.length), 2800);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  const showingModel = slides[activeIndex]?.isModel ?? false;

  return (
    <div className="group block overflow-hidden rounded-2xl border border-ink/10 bg-white p-6 transition-shadow hover:shadow-glow">
      <Link
        to={showingModel ? "/shop?type=READY_PRINTED" : `/design?asset=${asset.id}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden"
      >
        {slides.map((slide, i) => (
          <img
            key={slide.key}
            src={slide.url}
            alt={slide.isModel ? `${asset.name} on a model` : asset.name}
            className={`absolute inset-0 h-full w-full transition-opacity duration-700 group-hover:scale-110 ${
              slide.isModel ? "object-cover" : "object-contain p-1"
            } ${i === activeIndex ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </Link>
      <p className="mt-3 truncate text-center text-sm font-semibold text-ink/70">{asset.name}</p>
      {slides.length > 1 && (
        <p className="mt-0.5 text-center font-mono text-[10px] uppercase tracking-widest text-ink/35">
          {showingModel ? "on a real shirt" : "the print"}
        </p>
      )}
    </div>
  );
}

export function HomePage() {
  const { data: products } = useProducts();
  const { data: designAssets } = useDesignAssets();
  const featured = products?.slice(0, 4);
  const gallery = designAssets?.slice(0, 8);
  const hero = products?.find((p) => p.thumbnailUrl);

  return (
    <div className="overflow-x-clip">
      <section className="relative overflow-hidden">
        <Container className="grid gap-10 py-8 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
              Be Your Own Designer.
            </div>
            <h1 className="font-display text-[clamp(3.2rem,7vw,7rem)] leading-[0.86] text-ink text-balance">
              Design it.
              <br />
              We print it.
              <br />
              <span className="text-brand-500">You wear it.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg font-light text-ink/66">
              Put your art, your words, your whole idea on a shirt. Preview it live, order one or a hundred, and we
              print it ourselves.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <LinkButton to="/design" size="lg" className="animate-glow">
                Start Designing →
              </LinkButton>
              <LinkButton to="/shop?type=READY_PRINTED" variant="outline" size="lg">
                Browse ready-printed
              </LinkButton>
            </div>
            <div className="mt-9 flex gap-6 font-mono text-xs text-ink/50">
              <span>No minimum order</span>
              <span>Free design tool</span>
              <span>Cash on delivery</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative rounded-[20px] bg-white p-6 shadow-[0_20px_50px_rgba(4,4,4,0.08)]"
          >
            <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-2xl bg-[repeating-linear-gradient(135deg,#f3f2ee_0px,#f3f2ee_10px,#eceae4_10px,#eceae4_20px)]">
              {hero?.thumbnailUrl ? (
                <img src={hero.thumbnailUrl} alt={hero.name} className="h-full w-full object-cover" />
              ) : (
                <ShirtMark size={200} className="animate-float text-brand-500" />
              )}
              <div className="pointer-events-none absolute inset-0 animate-trail">
                <Sparkle size={90} className="text-white/95" />
              </div>
            </div>
            {hero && (
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="font-display text-2xl uppercase tracking-wide text-ink">{hero.name}</div>
                  <div className="mt-1 text-sm text-ink/55">
                    {hero.isCustomizable ? "Customizable · your print" : "Ready-printed"}
                  </div>
                </div>
                <div className="text-xl font-semibold text-brand-700">EGP {hero.fromPrice.toFixed(0)}</div>
              </div>
            )}
          </motion.div>
        </Container>

        <div className="border-y border-ink/[.07] bg-white py-4">
          <div className="flex animate-marquee gap-11 whitespace-nowrap">
            {[...marqueeWords, ...marqueeWords, ...marqueeWords].map((word, i) => (
              <span key={i} className="flex items-center gap-11 font-display text-3xl tracking-wide text-brand-500">
                {word}
                <span className="text-ink/25">◆</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <Container>
          <Reveal className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-5xl tracking-wide">START HERE</h2>
            <span className="font-mono text-xs text-ink/50">three ways in — one of them is yours</span>
          </Reveal>
          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_1fr]">
            <Link
              to="/design"
              className="group flex min-h-[280px] flex-col justify-between rounded-2xl bg-ink p-8 transition-transform hover:-translate-y-2"
            >
              <div className="flex items-start justify-between">
                <ShirtMark size={34} className="text-brand-500" />
                <span className="rounded-full bg-brand-500 px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-ink">
                  MAIN PATH
                </span>
              </div>
              <div>
                <div className="font-display text-5xl leading-[0.9] text-white">
                  DESIGN
                  <br />
                  YOUR OWN
                </div>
                <p className="mt-3.5 max-w-[300px] text-sm text-white/62">
                  Open the editor, drop in artwork or type, see it on the shirt instantly.
                </p>
                <span className="mt-5 inline-block rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-ink">
                  Start Designing →
                </span>
              </div>
            </Link>

            <Link
              to="/shop?type=READY_PRINTED"
              className="group flex flex-col justify-between rounded-2xl border border-ink/[.08] bg-white p-6 transition-transform hover:-translate-y-2"
            >
              <div className="flex h-[120px] items-end rounded-xl bg-[repeating-linear-gradient(135deg,#f3f2ee_0px,#f3f2ee_10px,#eceae4_10px,#eceae4_20px)] p-2.5 font-mono text-[10px] text-ink/40">
                printed range
              </div>
              <div>
                <div className="mt-4 font-display text-[34px] leading-[0.95]">READY-PRINTED</div>
                <p className="mt-2 text-[13px] text-ink/58">Artist drops, ship straight away.</p>
                <span className="mt-3.5 inline-block text-sm font-semibold text-brand-700">Shop the drop →</span>
              </div>
            </Link>

            <Link
              to="/shop"
              className="group flex flex-col justify-between rounded-2xl border border-ink/[.08] bg-white p-6 transition-transform hover:-translate-y-2"
            >
              <div className="flex h-[120px] items-end rounded-xl bg-[repeating-linear-gradient(135deg,#f3f2ee_0px,#f3f2ee_10px,#eceae4_10px,#eceae4_20px)] p-2.5 font-mono text-[10px] text-ink/40">
                the full rack
              </div>
              <div>
                <div className="mt-4 font-display text-[34px] leading-[0.95]">SHOP ALL</div>
                <p className="mt-2 text-[13px] text-ink/58">Every blank and every drop, in one place.</p>
                <span className="mt-3.5 inline-block text-sm font-semibold text-brand-700">Browse the rack →</span>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-4">
        <Container>
          <div className="grid gap-5 sm:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1}>
                <div className="rounded-2xl border border-ink/[.07] bg-white p-6">
                  <div className={`font-display text-4xl ${step.accent ? "text-pop-500" : "text-brand-500"}`}>{step.n}</div>
                  <h3 className="mt-2.5 mb-2 text-base font-semibold">{step.title}</h3>
                  <p className="text-[13px] leading-relaxed text-ink/58">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {gallery && gallery.length > 0 && (
        <section className="py-20">
          <Container>
            <Reveal className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Design inspiration</p>
              <h2 className="mt-3 font-display text-5xl tracking-wide">Prints people are starting with</h2>
              <p className="mx-auto mt-3 max-w-lg text-ink/60">
                A few favorites from our library — drop one straight into the canvas, then make it yours.
              </p>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {gallery.map((asset, index) => (
                <Reveal key={asset.id} delay={(index % 4) * 0.08}>
                  <DesignInspirationCard asset={asset} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {featured && featured.length > 0 && (
        <section className="pb-24">
          <Container>
            <Reveal className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-5xl tracking-wide">Fresh off the rack</h2>
              <LinkButton to="/shop" variant="ghost" size="sm">
                View all →
              </LinkButton>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {featured.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
