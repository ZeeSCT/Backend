// src/common/utils/money.ts

import { Decimal } from 'decimal.js';

export class Money {
  static n(value: any): Decimal {
    return new Decimal(value ?? 0);
  }

  static toNumber(value: any): number {
    return new Decimal(value ?? 0).toNumber();
  }
}