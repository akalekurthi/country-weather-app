import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import { CountryCardVm } from '../../core/models/country';
import { WeatherVm } from '../../core/models/weather';
import { CountriesService } from '../../core/services/countries';
import { FavoritesService } from '../../core/services/favorites';
import { WeatherService } from '../../core/services/weather';
import { Loader } from '../../shared/loader/loader';

@Component({
  selector: 'app-country-details',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    NgOptimizedImage,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    Loader,
  ],
  templateUrl: './country-details.html',
  styleUrl: './country-details.scss',
})
export class CountryDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly countriesService = inject(CountriesService);
  private readonly weatherService = inject(WeatherService);
  private readonly favorites = inject(FavoritesService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly favoritesSet = toSignal(this.favorites.favorites$, {
    initialValue: this.favorites.getAll(),
  });

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly weatherLoading = signal(true);
  protected readonly weatherError = signal<string | null>(null);

  private readonly code$ = this.route.paramMap.pipe(map((p) => (p.get('code') || '').toUpperCase()));

  protected readonly country = toSignal(
    this.code$.pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap((code) => this.countriesService.getCountryByCode(code)),
      tap((c) => {
        this.loading.set(false);
        if (!c) this.error.set('Country not found.');
      }),
      catchError(() => {
        this.loading.set(false);
        this.error.set('Could not load country details.');
        return of(undefined);
      }),
    ),
    { initialValue: undefined as CountryCardVm | undefined },
  );

  protected readonly isFavorite = computed(() => {
    const c = this.country();
    const fav = this.favoritesSet();
    return c ? fav.has(c.code) : false;
  });

  protected readonly weather = toSignal(
    this.code$.pipe(
      switchMap((code) => this.countriesService.getCountryByCode(code)),
      switchMap((c) => {
        this.weatherLoading.set(true);
        this.weatherError.set(null);

        if (!c) {
          return of(null as WeatherVm | null).pipe(finalize(() => this.weatherLoading.set(false)));
        }

        return this.weatherService
          .getCurrentWeather({
            capital: c.capital,
            countryName: c.name,
            countryCode: c.cca2,
            latlng: c.latlng,
          })
          .pipe(
            tap((w) => {
              if (!w && (c.capital || c.name)) {
                this.weatherError.set('Could not find weather for this capital right now.');
              }
            }),
            catchError(() => {
              this.weatherError.set('Could not load weather right now.');
              return of(null);
            }),
            finalize(() => this.weatherLoading.set(false)),
          );
      }),
    ),
    { initialValue: null as WeatherVm | null },
  );

  toggleFavorite(): void {
    const c = this.country();
    if (!c) return;
    this.favorites.toggle(c.code);
    const isFav = this.favorites.isFavorite(c.code);
    this.snackBar.open(isFav ? 'Added to favorites' : 'Removed from favorites', 'OK', {
      duration: 1500,
    });
  }
}
