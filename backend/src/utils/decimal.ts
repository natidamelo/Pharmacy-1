import Decimal from 'decimal.js';

export const round2 = (value: number): number =>
  new Decimal(value).toDecimalPlaces(2).toNumber();

export const round4 = (value: number): number =>
  new Decimal(value).toDecimalPlaces(4).toNumber();

export const formatCurrency = (value: number): string =>
  `ETB ${new Decimal(value).toFixed(2)}`;
