import { BadRequestException } from '@nestjs/common';

const ADDRESS_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.zz$/;

export function normalizeAddress(address: string): string {
  const normalized = address.trim().toLowerCase();

  if (!ADDRESS_PATTERN.test(normalized)) {
    throw new BadRequestException('Address must be a valid .zz website address');
  }

  return normalized;
}
