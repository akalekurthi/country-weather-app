import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly storageKey = 'cw_favorites_v1';
  private readonly favoritesSubject = new BehaviorSubject<Set<string>>(this.load());

  readonly favorites$ = this.favoritesSubject.asObservable();

  isFavorite(code: string): boolean {
    return this.favoritesSubject.value.has(code.toUpperCase());
  }

  toggle(code: string): void {
    const normalized = code.toUpperCase();
    const next = new Set(this.favoritesSubject.value);
    if (next.has(normalized)) next.delete(normalized);
    else next.add(normalized);
    this.favoritesSubject.next(next);
    this.persist(next);
  }

  getAll(): Set<string> {
    return new Set(this.favoritesSubject.value);
  }

  private load(): Set<string> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.map((x) => String(x).toUpperCase()));
    } catch {
      return new Set();
    }
  }

  private persist(set: Set<string>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(Array.from(set)));
    } catch {
      // ignore write failures (private mode / storage disabled)
    }
  }
}
