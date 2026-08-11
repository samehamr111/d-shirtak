import type { DashboardStatsDto, OrderDto, OrderStatus, OrderSummaryDto } from "@d-shirtak/shared";
import { NotFoundError, ValidationError } from "../../domain/errors.js";
import { canTransitionOrderStatus } from "../../domain/entities/order.entity.js";
import type { IOrderRepository } from "../../domain/ports/repositories/order.repository.js";
import type { IDesignRepository } from "../../domain/ports/repositories/design.repository.js";
import type { IProductRepository, IProductVariantRepository } from "../../domain/ports/repositories/product.repository.js";
import { toOrderDto, toOrderSummaryDto } from "../order/order.mapper.js";

const DAILY_REVENUE_DAYS = 14;

export class AdminOrderService {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly designs: IDesignRepository,
    private readonly variants: IProductVariantRepository,
    private readonly products: IProductRepository,
  ) {}

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

    let totalCost = 0;
    let hasIncompleteCostData = false;
    const costByVariant = new Map<string, number | null>();
    for (const order of revenueOrders) {
      for (const item of order.items) {
        let cost = costByVariant.get(item.productVariantId);
        if (cost === undefined) {
          const variant = await this.variants.findById(item.productVariantId);
          const product = variant ? await this.products.findById(variant.productId) : null;
          cost = product?.costPrice ?? null;
          costByVariant.set(item.productVariantId, cost);
        }
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
    return toOrderDto(order, this.designs);
  }

  async updateStatus(id: string, nextStatus: OrderStatus): Promise<OrderDto> {
    const order = await this.orders.findByIdAdmin(id);
    if (!order) throw new NotFoundError("Order", id);
    if (!canTransitionOrderStatus(order.status, nextStatus)) {
      throw new ValidationError(`Cannot move an order from ${order.status} to ${nextStatus}`);
    }
    const updated = await this.orders.updateStatus(id, nextStatus);
    return toOrderDto(updated, this.designs);
  }
}
