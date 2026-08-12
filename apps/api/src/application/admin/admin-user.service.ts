import type { AdminUserDto, AdminUserStatsDto } from "@d-shirtak/shared";
import { ForbiddenError, NotFoundError, ValidationError } from "../../domain/errors.js";
import type { IUserRepository } from "../../domain/ports/repositories/user.repository.js";
import type { IRefreshTokenRepository } from "../../domain/ports/repositories/refresh-token.repository.js";
import type { UserWithOrderCount } from "../../domain/entities/user.entity.js";

const DAYS_7_MS = 7 * 24 * 60 * 60 * 1000;
const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

function toUserDto(user: UserWithOrderCount): AdminUserDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    orderCount: user.orderCount,
    isBlocked: user.isBlocked,
    blockedReason: user.blockedReason,
    blockedAt: user.blockedAt ? user.blockedAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
}

export class AdminUserService {
  constructor(
    private readonly users: IUserRepository,
    private readonly refreshTokens: IRefreshTokenRepository,
  ) {}

  async listUsers(): Promise<AdminUserDto[]> {
    const rows = await this.users.listCustomers();
    return rows.map(toUserDto);
  }

  async getStats(): Promise<AdminUserStatsDto> {
    const now = Date.now();
    const [totalCustomers, newLast7Days, newLast30Days] = await Promise.all([
      this.users.countCustomers(),
      this.users.countCustomersSince(new Date(now - DAYS_7_MS)),
      this.users.countCustomersSince(new Date(now - DAYS_30_MS)),
    ]);
    return { totalCustomers, newLast7Days, newLast30Days };
  }

  async blockUser(id: string, reason: string): Promise<AdminUserDto> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError("User", id);
    if (user.role === "ADMIN") throw new ForbiddenError("Can't block an admin account");
    if (user.isBlocked) throw new ValidationError("This account is already blocked");

    await this.users.block(id, reason);
    // Cuts off access immediately rather than waiting for their current 15-minute access token
    // to expire on its own.
    await this.refreshTokens.revokeAllForUser(id);

    return toUserDto((await this.users.findByIdWithOrderCount(id))!);
  }

  async unblockUser(id: string): Promise<AdminUserDto> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError("User", id);
    if (!user.isBlocked) throw new ValidationError("This account isn't blocked");

    await this.users.unblock(id);
    return toUserDto((await this.users.findByIdWithOrderCount(id))!);
  }
}
