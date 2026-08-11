import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { LinkButton } from "../components/ui/LinkButton";
import { ProductCard } from "../components/ProductCard";
import { Reveal } from "../components/ui/Reveal";
import { useDesignAssets, useProducts } from "../features/catalog/catalog-api";

const marqueeWords = ["DESIGN IT", "PRINT IT", "WEAR IT", "REPEAT"];

const steps = [
  {
    n: "01",
    title: "Pick a blank",
    body: "Choose a hoodie or tee, then your color and size — stock updates live.",
  },
  {
    n: "02",
    title: "Make it yours",
    body: "Upload your own art or type it out in Arabic or English. Drag, resize, layer it up.",
  },
  {
    n: "03",
    title: "We print, you wear",
    body: "Confirm the mockup, checkout with cash on delivery, and we get to work.",
  },
];

export function HomePage() {
  const { data: products } = useProducts();
  const { data: designAssets } = useDesignAssets();
  const featured = products?.slice(0, 4);
  const gallery = designAssets?.slice(0, 8);
  // Products land in the catalog before a color/mockup is added to them, which leaves
  // thumbnailUrl empty -- skip those here so the hero doesn't blink between showing and
  // hiding a card as newly-created, not-yet-photographed products rotate through.
  const [heroA, heroB] = products?.filter((p) => p.thumbnailUrl) ?? [];

  return (
    <div className="overflow-x-clip">
      <section
        className="relative overflow-hidden bg-ink text-paper"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 94%, 0 100%)" }}
      >
        <div
          className="pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand-500/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-pop-500/20 blur-3xl"
          aria-hidden
        />

        <Container className="relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-400"
            >
              Custom apparel, done right
            </motion.p>
            <h1 className="mt-4 font-display text-7xl leading-[0.9] sm:text-8xl lg:text-[7rem]">
              {["Wear what's", "actually yours."].map((line, i) => (
                <motion.span
                  key={line}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className={`block ${i === 1 ? "text-brand-500" : ""}`}
                >
                  {line}
                </motion.span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 max-w-lg text-lg text-paper/70"
            >
              Blank hoodies and tees, a live design canvas, and a print team that ships it. Upload your art, drop in
              text, pick from our library — then hit checkout.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <LinkButton to="/design" size="lg">
                Start Designing
              </LinkButton>
              <LinkButton
                to="/shop"
                variant="outline"
                size="lg"
                className="border-paper/30 text-paper hover:bg-paper hover:text-ink"
              >
                Shop Blanks
              </LinkButton>
            </motion.div>
          </div>

          <div className="relative hidden h-[26rem] lg:block" aria-hidden={!heroA}>
            {heroA?.thumbnailUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -6 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ ["--float-rotate" as string]: "-6deg" }}
                className="absolute left-6 top-4 w-56 animate-float rounded-2xl bg-white p-3 shadow-2xl"
              >
                <img src={heroA.thumbnailUrl} alt={heroA.name} className="aspect-[4/5] w-full rounded-xl object-cover" />
                <p className="mt-2 text-center text-xs font-semibold text-ink/70">{heroA.name}</p>
              </motion.div>
            )}
            {heroB?.thumbnailUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 8 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ ["--float-rotate" as string]: "8deg" }}
                className="absolute right-2 top-24 w-48 animate-float rounded-2xl bg-white p-3 shadow-2xl [animation-delay:1.5s]"
              >
                <img src={heroB.thumbnailUrl} alt={heroB.name} className="aspect-[4/5] w-full rounded-xl object-cover" />
                <p className="mt-2 text-center text-xs font-semibold text-ink/70">EGP {heroB.fromPrice.toFixed(0)}</p>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute bottom-8 right-16 flex h-24 w-24 rotate-6 items-center justify-center rounded-full bg-brand-500 text-center font-display text-sm leading-tight text-white shadow-xl"
            >
              Design
              <br />
              your own
            </motion.div>
          </div>
        </Container>

        <div className="relative border-t border-paper/10 py-4">
          <div className="flex animate-marquee gap-12 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.3em] text-paper/40">
            {[...marqueeWords, ...marqueeWords, ...marqueeWords].map((word, i) => (
              <span key={i} className={i % 4 === 1 ? "text-brand-400" : ""}>
                {word}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <Container>
          <Reveal className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-5xl">Fresh off the rack</h2>
            <LinkButton to="/shop" variant="ghost" size="sm">
              View all →
            </LinkButton>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {featured?.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </Container>
      </section>

      {gallery && gallery.length > 0 && (
        <section className="bg-brand-50/60 py-24">
          <Container>
            <Reveal className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-600">Design inspiration</p>
              <h2 className="mt-3 font-display text-5xl">Prints people are starting with</h2>
              <p className="mx-auto mt-3 max-w-lg text-ink/60">
                A few favorites from our library — drop one straight into the canvas, then make it yours.
              </p>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {gallery.map((asset, index) => (
                <Reveal key={asset.id} delay={(index % 4) * 0.08}>
                  <Link
                    to="/design"
                    className="group block overflow-hidden rounded-2xl border border-ink/10 bg-white p-6 transition-shadow hover:shadow-glow"
                  >
                    <div className="flex aspect-square items-center justify-center">
                      <img
                        src={asset.imageUrl}
                        alt={asset.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <p className="mt-3 truncate text-center text-sm font-semibold text-ink/70">{asset.name}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="relative overflow-hidden bg-ink py-24 text-paper">
        <p
          className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 select-none font-display text-[14rem] leading-none text-paper/[0.03] sm:text-[20rem]"
          aria-hidden
        >
          HOW
        </p>
        <Container className="relative">
          <Reveal>
            <h2 className="font-display text-5xl">How it works</h2>
          </Reveal>
          <div className="relative mt-14 grid gap-10 sm:grid-cols-3">
            <div
              className="pointer-events-none absolute top-8 hidden h-px w-full bg-gradient-to-r from-transparent via-paper/15 to-transparent sm:block"
              aria-hidden
            />
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.12}>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 font-display text-2xl text-white shadow-glow">
                  {step.n}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-paper/60">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-brand-500 px-8 py-16 text-center text-white sm:px-16">
              <div
                className="pointer-events-none absolute -left-10 -top-10 h-52 w-52 rounded-full border-8 border-white/10"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-64 rounded-full border-8 border-white/10"
                aria-hidden
              />
              <h2 className="font-display text-5xl">Got a design in mind?</h2>
              <p className="mx-auto mt-4 max-w-md text-white/85">
                Our canvas supports your own uploads, English and Arabic type, and a library of ready-made designs.
              </p>
              <LinkButton to="/design" size="lg" variant="secondary" className="mt-8 bg-ink text-paper hover:bg-black">
                Open the Designer
              </LinkButton>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
