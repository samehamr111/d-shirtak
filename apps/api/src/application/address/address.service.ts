import type { AddressDto, AddressInput } from "@d-shirtak/shared";
import { ForbiddenError, NotFoundError } from "../../domain/errors.js";
import type { IAddressRepository } from "../../domain/ports/repositories/address.repository.js";
import type { Address } from "../../domain/entities/user.entity.js";

function toDto(address: Address): AddressDto {
  return {
    id: address.id,
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? undefined,
    city: address.city,
    governorate: address.governorate,
    postalCode: address.postalCode ?? undefined,
    country: address.country,
    isDefault: address.isDefault,
  };
}

export class AddressService {
  constructor(private readonly addresses: IAddressRepository) {}

  async list(userId: string): Promise<AddressDto[]> {
    const rows = await this.addresses.listByUser(userId);
    return rows.map(toDto);
  }

  async create(userId: string, input: AddressInput): Promise<AddressDto> {
    if (input.isDefault) await this.addresses.clearDefault(userId);
    const created = await this.addresses.create({ ...input, userId, line2: input.line2 ?? null, postalCode: input.postalCode ?? null });
    return toDto(created);
  }

  async update(userId: string, addressId: string, input: Partial<AddressInput>): Promise<AddressDto> {
    const existing = await this.assertOwned(userId, addressId);
    if (input.isDefault) await this.addresses.clearDefault(userId);
    const updated = await this.addresses.update(existing.id, {
      ...input,
      line2: input.line2 === undefined ? undefined : input.line2 ?? null,
      postalCode: input.postalCode === undefined ? undefined : input.postalCode ?? null,
    });
    return toDto(updated);
  }

  async delete(userId: string, addressId: string): Promise<void> {
    await this.assertOwned(userId, addressId);
    await this.addresses.delete(addressId);
  }

  private async assertOwned(userId: string, addressId: string): Promise<Address> {
    const address = await this.addresses.findById(addressId);
    if (!address) throw new NotFoundError("Address", addressId);
    if (address.userId !== userId) throw new ForbiddenError();
    return address;
  }
}
