import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { CountryCardVm, RestCountry } from '../models/country';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private readonly api = 'https://restcountries.com/v3.1';
  private readonly allCountries$: Observable<CountryCardVm[]>;

  constructor(private readonly http: HttpClient) {
    this.allCountries$ = this.http
      .get<RestCountry[]>(
        `${this.api}/all?fields=name,flags,region,cca2,cca3,capital,population,currencies,capitalInfo`,
      )
      .pipe(
        map((items) =>
          items
            .map((c) => this.toVm(c))
            .filter((c) => !!c.code && !!c.name)
            .sort((a, b) => a.name.localeCompare(b.name)),
        ),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  getCountries(): Observable<CountryCardVm[]> {
    return this.allCountries$;
  }

  getCountryByCode(code: string): Observable<CountryCardVm | undefined> {
    const normalized = (code || '').toUpperCase();
    return this.allCountries$.pipe(map((list) => list.find((c) => c.code === normalized)));
  }

  private toVm(c: RestCountry): CountryCardVm {
    const currency = c.currencies ? this.formatCurrency(c.currencies) : undefined;
    const flagUrl = c.flags?.svg || c.flags?.png;
    return {
      code: c.cca3,
      cca2: c.cca2,
      name: c.name?.common ?? c.cca3,
      flagUrl,
      flagAlt: c.flags?.alt ?? `${c.name?.common ?? c.cca3} flag`,
      region: c.region,
      capital: c.capital?.[0],
      population: c.population,
      currency,
      latlng: c.capitalInfo?.latlng,
    };
  }

  private formatCurrency(currencies: NonNullable<RestCountry['currencies']>): string {
    const first = Object.values(currencies)[0];
    if (!first) return '';
    return first.symbol ? `${first.name} (${first.symbol})` : first.name;
  }
}
