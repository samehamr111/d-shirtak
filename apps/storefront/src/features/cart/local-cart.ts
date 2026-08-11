import { useSyncExternalStore } from "react";
import type { CartDto, CartItemDto } from "@d-shirtak/shared";

const STORAGE_KEY = "dshirtak:guestCart";

export interface LocalCartItem extends CartItemDto {
  frontDesignJson: Record<string, unknown> | null;
  backDesignJson: Record<string, unknown> | null;
}

type Listener = () => void;
const listeners = new Set<Listener>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readAll(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalCartItem[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: LocalCartItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emit();
}

/** Cart storage for a guest (not logged in) shopper. Carts and designs are owned by a real user
 *  row server-side, so nothing here can be persisted to the API until they log in -- this is the
 *  entire cart for a guest, kept in localStorage until then. */
export const localCart = {
  getAll: readAll,

  add(item: Omit<LocalCartItem, "id">): void {
    const items = readAll();
    // Mirror the server cart's behavior: adding the same plain (undesigned) variant again bumps
    // quantity instead of creating a duplicate line. A customized item is always its own line.
    const canMerge = !item.frontDesignJson && !item.backDesignJson;
    const existing = canMerge
      ? items.find((i) => i.productVariantId === item.productVariantId && !i.frontDesignJson && !i.backDesignJson)
      : undefined;
    if (existing) {
      existing.quantity = Math.min(20, existing.quantity + item.quantity);
    } else {
      items.push({ ...item, id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}` });
    }
    writeAll(items);
  },

  updateQuantity(id: string, quantity: number): void {
    writeAll(readAll().map((i) => (i.id === id ? { ...i, quantity } : i)));
  },

  remove(id: string): void {
    writeAll(readAll().filter((i) => i.id !== id));
  },

  clear(): void {
    writeAll([]);
  },
};

export function toCartDto(items: LocalCartItem[]): CartDto {
  return { items, subtotal: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) };
}

export function useLocalCart(): LocalCartItem[] {
  return useSyncExternalStore(subscribe, readAll, readAll);
}
