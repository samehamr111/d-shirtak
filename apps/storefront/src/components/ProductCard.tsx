import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { ProductSummaryDto } from "@d-shirtak/shared";
import { StarRating } from "./ui/StarRating";
import { placeholderRating } from "../lib/placeholder-rating";

const NEW_ARRIVAL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function ProductCard({ product, index = 0 }: { product: ProductSummaryDto; index?: number }) {
  const isNewArrival = Date.now() - new Date(product.createdAt).getTime() < NEW_ARRIVAL_WINDOW_MS;
  const { rating, reviewCount } = placeholderRating(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link
        to={`/shop/${product.slug}`}
        className="block overflow-hidden rounded-2xl border border-ink/10 bg-white transition-shadow duration-300 group-hover:shadow-[0_18px_40px_rgba(4,4,4,0.1)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-ink/5">
          {product.thumbnailUrl && (
            <img
              src={product.thumbnailUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}
          {!product.inStock && (
            <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-paper">
              Sold Out
            </span>
          )}
          {isNewArrival && (
            <span className="absolute right-3 top-3 rounded-full bg-pop-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              New Arrival
            </span>
          )}
          {product.isCustomizable ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-brand-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">
              Customizable
            </span>
          ) : (
            <span className="absolute bottom-3 left-3 rounded-full bg-ink/[.07] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-ink/60">
              Ready-Printed
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">{product.name}</h3>
            <p className="whitespace-nowrap text-sm font-semibold text-brand-700">From EGP {product.fromPrice.toFixed(0)}</p>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <StarRating rating={rating} reviewCount={reviewCount} />
            <div className="flex -space-x-1.5">
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color.id}
                  title={color.name}
                  className="h-4 w-4 rounded-full border-2 border-white ring-1 ring-ink/10"
                  style={{ backgroundColor: color.hexCode }}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
