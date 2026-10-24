import { Injectable } from '@nestjs/common';

/**
 * Einfache In-Memory-Begrenzung. Gilt nur für eine einzelne API-Instanz;
 * bei mehreren Instanzen müsste der Zähler in einen gemeinsamen Speicher.
 */
@Injectable()
export class RateLimiter {
  private hits = new Map<string, number[]>();

  tooMany(key: string, max: number, windowMs: number, now = Date.now()): boolean {
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < windowMs);
    this.hits.set(key, recent);
    return recent.length >= max;
  }

  record(key: string, now = Date.now()): void {
    const list = this.hits.get(key) ?? [];
    list.push(now);
    this.hits.set(key, list);
  }

  reset(key?: string): void {
    if (key) this.hits.delete(key);
    else this.hits.clear();
  }
}
