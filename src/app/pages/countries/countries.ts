import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize, of, tap } from 'rxjs';
import { CountryCardVm } from '../../core/models/country';
import { CountriesService } from '../../core/services/countries';
import { FavoritesService } from '../../core/services/favorites';
import { Loader } from '../../shared/loader/loader';

@Component({
  selector: 'app-countries',
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    NgOptimizedImage,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    MatTooltipModule,
    Loader,
  ],
  templateUrl: './countries.html',
  styleUrl: './countries.scss',
})
export class Countries {
  private readonly countriesService = inject(CountriesService);
  private readonly favorites = inject(FavoritesService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly query = signal('');
  protected readonly favoritesOnly = signal(false);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly favoritesSet = toSignal(this.favorites.favorites$, {
    initialValue: this.favorites.getAll(),
  });

  private readonly countries = toSignal(
    this.countriesService.getCountries().pipe(
      tap(() => {
        this.error.set(null);
      }),
      catchError(() => {
        this.error.set('Could not load countries. Please try again.');
        return of([] as CountryCardVm[]);
      }),
      finalize(() => this.loading.set(false)),
    ),
    { initialValue: [] as CountryCardVm[] },
  );

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const favOnly = this.favoritesOnly();
    const fav = this.favoritesSet();
    return this.countries().filter((c) => {
      if (favOnly && !fav.has(c.code)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.region ?? '').toLowerCase().includes(q) ||
        (c.capital ?? '').toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
      );
    });
  });

  toggleFavorite(country: CountryCardVm): void {
    this.favorites.toggle(country.code);
    const isFav = this.favorites.isFavorite(country.code);
    this.snackBar.open(isFav ? 'Added to favorites' : 'Removed from favorites', 'OK', {
      duration: 1500,
    });
  }

  clearSearch(): void {
    this.query.set('');
  }

  reload(): void {
    window.location.reload();
  }
}
