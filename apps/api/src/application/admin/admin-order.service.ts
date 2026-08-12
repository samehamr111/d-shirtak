import type { DashboardStatsDto, OrderDto, OrderStatus, OrderSummaryDto } from "@d-shirtak/shared";
import { NotFoundError, ValidationError } from "../../domain/errors.js";
import { canTransitionOrderStatus } from "../../domain/entities/order.entity.js";
import type { OrderWithCustomer } from "../../domain/ports/repositories/order.repository.js";
import type { IOrderRepository } from "../../domain/ports/repositories/order.repository.js";
import type { IDesignRepository } from "../../domain/ports/repositories/design.repository.js";
import type { IDesignAssetRepository } from "../../domain/ports/repositories/design-library.repository.js";
import type { IProductRepository, IProductVariantRepository } from "../../domain/ports/repositories/product.repository.js";
import type { IFileStorage } from "../../domain/ports/file-storage.port.js";
import { toOrderDto, toOrderSummaryDto } from "../order/order.mapper.js";

const DAILY_REVENUE_DAYS = 14;

export class AdminOrderService {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly designs: IDesignRepository,
    private readonly variants: IProductVariantRepository,
    private readonly products: IProductRepository,
    private readonly designAssets: IDesignAssetRepository,
    private readonly fileStorage: IFileStorage,
  ) {}

  private async designAssetsByUrl(): Promise<Map<string, { id: string; name: string }>> {
    const assets = await this.designAssets.listAll();
    return new Map(assets.map((a) => [a.imageUrl, { id: a.id, name: a.name }]));
  }

  async listOrders(status?: OrderStatus): Promise<OrderSummaryDto[]> {
    const rows = await this.orders.listAdmin(status);
    return rows.map(toOrderSummaryDto);
  }

  async getStats(): Promise<DashboardStatsDto> {
    const allOrders = await this.orders.listAdmin();
    const revenueOrders = allOrders.filter((o) => o.status !== "CANCELLED");

    const totalRevenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);
    const pendingCount = allOrders.filter((o) => o.status === "PENDING").length;
    const avgOrderValue = revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0;

    const variantIds = [...new Set(revenueOrders.flatMap((o) => o.items.map((i) => i.productVariantId)))];
    const variants = await this.variants.findManyByIds(variantIds);
    const productIds = [...new Set(variants.map((v) => v.productId))];
    const products = await this.products.findManyByIds(productIds);
    const productCostById = new Map(products.map((p) => [p.id, p.costPrice]));
    const costByVariant = new Map(variants.map((v) => [v.id, productCostById.get(v.productId) ?? null]));

    let totalCost = 0;
    let hasIncompleteCostData = false;
    for (const order of revenueOrders) {
      for (const item of order.items) {
        const cost = costByVariant.get(item.productVariantId) ?? null;
        if (cost === null) {
          hasIncompleteCostData = true;
        } else {
          totalCost += cost * item.quantity;
        }
      }
    }

    const dailyRevenue: { date: string; revenue: number }[] = [];
    for (let i = DAILY_REVENUE_DAYS - 1; i >= 0; i--) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const revenue = revenueOrders
        .filter((o) => o.createdAt >= day && o.createdAt < next)
        .reduce((sum, o) => sum + o.total, 0);
      dailyRevenue.push({ date: day.toISOString(), revenue });
    }

    return {
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
      hasIncompleteCostData,
      orderCount: allOrders.length,
      pendingCount,
      avgOrderValue,
      dailyRevenue,
    };
  }

  async getOrder(id: string): Promise<OrderDto> {
    const order = await this.orders.findByIdAdmin(id);
    if (!order) throw new NotFoundError("Order", id);
    return toOrderDto(order, this.designs, { designAssetsByUrl: await this.designAssetsByUrl() });
  }

  async updateStatus(id: string, nextStatus: OrderStatus): Promise<OrderDto> {
    const order = await this.orders.findByIdAdmin(id);
    if (!order) throw new NotFoundError("Order", id);
    if (!canTransitionOrderStatus(order.status, nextStatus)) {
      throw new ValidationError(`Cannot move an order from ${order.status} to ${nextStatus}`);
    }

    if (nextStatus === "CANCELLED") {
      // Cancelling deletes the order outright rather than just flagging it -- per product intent,
      // a cancelled order shouldn't linger with its (now pointless) uploaded designs taking up
      // storage. Order deletion cascades its OrderItems first (schema-level), so the
      // isReferenced() check below correctly sees a design as orphaned once this item no longer
      // exists, rather than tripping over its own about-to-be-removed reference.
      await this.cancelAndPurge(order);
      return toOrderDto({ ...order, status: "CANCELLED" }, this.designs);
    }

    const updated = await this.orders.updateStatus(id, nextStatus);
    return toOrderDto(updated, this.designs, { designAssetsByUrl: await this.designAssetsByUrl() });
  }

  private async cancelAndPurge(order: OrderWithCustomer): Promise<void> {
    const designIds = order.items.flatMap((item) =>
      [item.frontDesignId, item.backDesignId].filter((designId): designId is string => !!designId),
    );
    await this.orders.delete(order.id);
    for (const designId of designIds) {
      const stillReferenced = await this.designs.isReferenced(designId);
      if (stillReferenced) continue;
      const design = await this.designs.findById(designId);
      if (!design) continue;
      await this.fileStorage.deleteByUrl(design.previewImageUrl);
      await this.designs.delete(designId);
    }
  }
}
