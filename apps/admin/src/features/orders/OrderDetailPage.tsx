import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { DesignElementDto, OrderItemDto } from "@d-shirtak/shared";
import { useOrder, useUpdateOrderStatus } from "./api";
import { getNextStatuses, STATUS_ACTION_LABELS, STATUS_LABELS } from "./status";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { PrimaryButton, DangerButton, SecondaryButton } from "../../components/form";
import { Modal } from "../../components/Modal";
import { ApiError } from "../../lib/api-client";
import { useToast } from "../../components/Toast";
import { OrderStatus } from "@d-shirtak/shared";
import { ModelShotPromptModal } from "../products/ModelShotPromptModal";

type PromptTarget = { item: OrderItemDto; side: "front" | "back"; designImageUrl: string };

// Every element the customer added -- each piece of text and each image -- is its own separately
// downloadable item here, so whoever's prepping the print file doesn't have to dig it back out of
// a flattened mockup screenshot.
function DesignElementsList({ elements }: { elements: DesignElementDto[] | undefined }) {
  if (!elements || elements.length === 0) return null;
  return (
    <div className="mt-2 space-y-2 border-t border-ink/10 pt-2">
      {elements.map((el, i) =>
        el.kind === "text" ? (
          <div key={i} className="text-xs text-ink/70">
            <p>
              <span className="font-medium text-ink">Text:</span> "{el.content}"
              {el.fontFamily && <span className="text-ink/50"> — {el.fontFamily}</span>}
            </p>
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(el.fontFamily ? `${el.content}\n\nFont: ${el.fontFamily}` : el.content)}`}
              download="text.txt"
              className="font-medium text-brand-600 hover:underline"
            >
              Download text
            </a>
          </div>
        ) : (
          <div key={i} className="flex items-center gap-2 text-xs">
            <img src={el.url} alt="Design element" className="h-8 w-8 shrink-0 rounded border border-ink/10 object-cover" />
            <div className="flex flex-col items-start gap-0.5">
              <a href={el.url} download className="font-medium text-brand-600 hover:underline">
                Download image
              </a>
              {el.libraryAssetName && (
                <a href={el.url} download className="font-medium text-brand-600 hover:underline">
                  Download library print — {el.libraryAssetName}
                </a>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function DesignSide({
  label,
  previewUrl,
  elements,
  onGeneratePrompt,
}: {
  label: string;
  previewUrl: string | null;
  elements: DesignElementDto[] | undefined;
  onGeneratePrompt?: () => void;
}) {
  if (!previewUrl) {
    return (
      <div className="flex h-32 w-32 items-center justify-center rounded border border-dashed border-ink/20 text-xs text-ink/40">
        No {label} design
      </div>
    );
  }
  return (
    <div className="w-40">
      <img src={previewUrl} alt={`${label} design`} className="h-32 w-32 rounded border border-ink/10 object-contain" />
      <div className="mt-1 flex flex-wrap gap-x-2 text-xs">
        <a href={previewUrl} download className="font-medium text-brand-600 hover:underline">
          Download mockup
        </a>
        {onGeneratePrompt && (
          <button type="button" onClick={onGeneratePrompt} className="font-medium text-brand-600 hover:underline">
            Model-shot prompt
          </button>
        )}
      </div>
      <DesignElementsList elements={elements} />
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrder(id);
  const updateStatus = useUpdateOrderStatus(id ?? "");
  const { showToast } = useToast();
  const [promptTarget, setPromptTarget] = useState<PromptTarget | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (isLoading) return <p className="text-sm text-ink/60">Loading…</p>;
  if (error || !order) return <p className="text-sm text-red-600">Failed to load order.</p>;

  const handleStatusChange = async (status: (typeof OrderStatus)[keyof typeof OrderStatus]) => {
    try {
      await updateStatus.mutateAsync(status);
      if (status === OrderStatus.CANCELLED) {
        showToast({ type: "success", message: "Order cancelled and removed." });
        navigate("/orders");
        return;
      }
      showToast({ type: "success", message: `Order marked as ${STATUS_LABELS[status]}` });
    } catch (err) {
      showToast({ type: "error", message: err instanceof ApiError ? err.message : "Failed to update status." });
    } finally {
      setConfirmCancel(false);
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
                <DangerButton key={s} onClick={() => setConfirmCancel(true)} disabled={updateStatus.isPending}>
                  {STATUS_ACTION_LABELS[s]}
                </DangerButton>
              ) : (
                <PrimaryButton key={s} onClick={() => handleStatusChange(s)} disabled={updateStatus.isPending}>
                  {STATUS_ACTION_LABELS[s]}
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
              <div className="flex gap-3">
                <DesignSide
                  label="front"
                  previewUrl={item.frontDesignPreviewUrl}
                  elements={item.frontDesignElements}
                  onGeneratePrompt={
                    item.garmentType && item.colorHex
                      ? () => setPromptTarget({ item, side: "front", designImageUrl: item.frontDesignPreviewUrl! })
                      : undefined
                  }
                />
                <DesignSide
                  label="back"
                  previewUrl={item.backDesignPreviewUrl}
                  elements={item.backDesignElements}
                  onGeneratePrompt={
                    item.garmentType && item.colorHex
                      ? () => setPromptTarget({ item, side: "back", designImageUrl: item.backDesignPreviewUrl! })
                      : undefined
                  }
                />
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

      {confirmCancel && (
        <Modal title="Cancel this order?" onClose={() => setConfirmCancel(false)}>
          <p className="mb-4 text-sm text-ink/70">
            This permanently deletes order {order.orderNumber} and any of its designs/uploads that aren't still used
            elsewhere. This can't be undone.
          </p>
          <div className="flex justify-end gap-2">
            <SecondaryButton onClick={() => setConfirmCancel(false)}>Keep order</SecondaryButton>
            <DangerButton onClick={() => handleStatusChange(OrderStatus.CANCELLED)} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? "Cancelling…" : "Yes, cancel and delete"}
            </DangerButton>
          </div>
        </Modal>
      )}
    </div>
  );
}
