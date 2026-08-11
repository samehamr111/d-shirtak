import { useState } from "react";
import { useParams } from "react-router-dom";
import type { OrderItemDto } from "@d-shirtak/shared";
import { useOrder, useUpdateOrderStatus } from "./api";
import { getNextStatuses } from "./status";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { PrimaryButton, DangerButton } from "../../components/form";
import { ApiError } from "../../lib/api-client";
import { useToast } from "../../components/Toast";
import { OrderStatus } from "@d-shirtak/shared";
import { ModelShotPromptModal } from "../products/ModelShotPromptModal";

type PromptTarget = { item: OrderItemDto; side: "front" | "back"; designImageUrl: string };

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrder(id);
  const updateStatus = useUpdateOrderStatus(id ?? "");
  const { showToast } = useToast();
  const [promptTarget, setPromptTarget] = useState<PromptTarget | null>(null);

  if (isLoading) return <p className="text-sm text-ink/60">Loading…</p>;
  if (error || !order) return <p className="text-sm text-red-600">Failed to load order.</p>;

  const handleStatusChange = async (status: (typeof OrderStatus)[keyof typeof OrderStatus]) => {
    try {
      await updateStatus.mutateAsync(status);
      showToast({ type: "success", message: `Order marked as ${status}` });
    } catch (err) {
      showToast({ type: "error", message: err instanceof ApiError ? err.message : "Failed to update status." });
    }
  };

  const nextStatuses = getNextStatuses(order.status);
  const address = order.shippingAddress;

  return (
    <div>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={new Date(order.createdAt).toLocaleString()}
        actions={<StatusBadge status={order.status} />}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-white p-4">
          <h2 className="mb-2 text-base font-semibold">Shipping address</h2>
          <p className="text-sm">{address.fullName}</p>
          <p className="text-sm text-ink/70">{address.phone}</p>
          <p className="text-sm text-ink/70">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
          </p>
          <p className="text-sm text-ink/70">
            {address.city}, {address.governorate} {address.postalCode ?? ""}
          </p>
          <p className="text-sm text-ink/70">{address.country}</p>
        </section>

        <section className="rounded-lg border border-ink/10 bg-white p-4">
          <h2 className="mb-2 text-base font-semibold">Summary</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Subtotal</dt>
              <dd>EGP {order.subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Shipping</dt>
              <dd>EGP {order.shippingFee.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>EGP {order.total.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Payment</dt>
              <dd>{order.paymentMethod}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mb-6 rounded-lg border border-ink/10 bg-white p-4">
        <h2 className="mb-3 text-base font-semibold">Update status</h2>
        {nextStatuses.length === 0 ? (
          <p className="text-sm text-ink/60">No further status transitions available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) =>
              s === OrderStatus.CANCELLED ? (
                <DangerButton key={s} onClick={() => handleStatusChange(s)} disabled={updateStatus.isPending}>
                  Cancel order
                </DangerButton>
              ) : (
                <PrimaryButton key={s} onClick={() => handleStatusChange(s)} disabled={updateStatus.isPending}>
                  Mark as {s}
                </PrimaryButton>
              ),
            )}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-4">
        <h2 className="mb-3 text-base font-semibold">Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-start gap-4 rounded border border-ink/10 p-3">
              <div className="flex gap-2">
                {item.frontDesignPreviewUrl ? (
                  <div>
                    <img
                      src={item.frontDesignPreviewUrl}
                      alt={`${item.productName} front design`}
                      className="h-32 w-32 rounded border border-ink/10 object-contain"
                    />
                    {item.garmentType && item.colorHex && (
                      <button
                        type="button"
                        onClick={() =>
                          setPromptTarget({ item, side: "front", designImageUrl: item.frontDesignPreviewUrl! })
                        }
                        className="mt-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        Generate model-shot prompt
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded border border-dashed border-ink/20 text-xs text-ink/40">
                    No front design
                  </div>
                )}
                {item.backDesignPreviewUrl ? (
                  <div>
                    <img
                      src={item.backDesignPreviewUrl}
                      alt={`${item.productName} back design`}
                      className="h-32 w-32 rounded border border-ink/10 object-contain"
                    />
                    {item.garmentType && item.colorHex && (
                      <button
                        type="button"
                        onClick={() =>
                          setPromptTarget({ item, side: "back", designImageUrl: item.backDesignPreviewUrl! })
                        }
                        className="mt-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        Generate model-shot prompt
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded border border-dashed border-ink/20 text-xs text-ink/40">
                    No back design
                  </div>
                )}
              </div>
              <div className="min-w-[12rem] flex-1 text-sm">
                <p className="font-medium">{item.productName}</p>
                <p className="text-ink/60">
                  {item.colorName} / {item.sizeName}
                </p>
                <p className="text-ink/60">Qty {item.quantity}</p>
                <p className="text-ink/60">Unit price EGP {item.unitPrice.toFixed(2)}</p>
                <p className="font-medium">Line total EGP {item.lineTotal.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {promptTarget && promptTarget.item.garmentType && promptTarget.item.colorHex && (
        <ModelShotPromptModal
          productName={promptTarget.item.productName}
          garmentType={promptTarget.item.garmentType}
          colorName={promptTarget.item.colorName}
          colorHex={promptTarget.item.colorHex}
          sizeName={promptTarget.item.sizeName}
          designImageUrl={promptTarget.designImageUrl}
          onClose={() => setPromptTarget(null)}
        />
      )}
    </div>
  );
}
