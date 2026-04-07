import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { OpenMeteoCurrentResponse, WeatherVm } from '../models/weather';

type GeocodeResult = {
  results?: Array<{ latitude: number; longitude: number; name: string }>;
};

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  constructor(private readonly http: HttpClient) {}

  getCurrentWeather(options: {
    capital?: string;
    countryName?: string;
    /** ISO 3166-1 alpha-2 */
    countryCode?: string;
    latlng?: [number, number];
  }): Observable<WeatherVm | null> {
    return this.resolveCoordinates(options).pipe(
      switchMap((ll) => (ll ? this.getForecast(ll[0], ll[1]) : of(null))),
    );
  }

  private resolveCoordinates(options: {
    capital?: string;
    countryName?: string;
    countryCode?: string;
    latlng?: [number, number];
  }): Observable<[number, number] | null> {
    if (this.isValidLatLng(options.latlng)) {
      return of(options.latlng as [number, number]);
    }

    const capital = (options.capital || '').trim();
    const countryName = (options.countryName || '').trim();
    const countryCode = (options.countryCode || '').trim().toUpperCase();

    if (capital) {
      return this.geocodeByName(capital, countryCode).pipe(
        switchMap((ll) =>
          ll ? of(ll) : this.geocodeByName(`${capital}, ${countryName}`.trim(), countryCode),
        ),
      );
    }

    if (countryName) {
      return this.geocodeByName(countryName, countryCode);
    }

    return of(null);
  }

  private geocodeByName(name: string, countryCode: string): Observable<[number, number] | null> {
    const q = name.trim();
    if (!q) return of(null);

    let url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
    if (countryCode.length === 2) {
      url += `&countryCode=${encodeURIComponent(countryCode)}`;
    }

    return this.http.get<GeocodeResult>(url).pipe(
      map((res) => {
        const first = res.results?.[0];
        return first ? ([first.latitude, first.longitude] as [number, number]) : null;
      }),
      catchError(() => of(null)),
    );
  }

  private getForecast(lat: number, lng: number): Observable<WeatherVm | null> {
    const url =
      'https://api.open-meteo.com/v1/forecast?' +
      `latitude=${lat}&longitude=${lng}` +
      '&current=temperature_2m,weather_code,wind_speed_10m' +
      '&timezone=auto';

    return this.http.get<OpenMeteoCurrentResponse>(url).pipe(
      map((res) => this.toVm(res)),
      catchError(() => of(null)),
    );
  }

  private isValidLatLng(ll?: [number, number] | null): ll is [number, number] {
    if (!ll || ll.length !== 2) return false;
    const [lat, lng] = ll;
    if (typeof lat !== 'number' || typeof lng !== 'number') return false;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
    return true;
  }

  private toVm(res: OpenMeteoCurrentResponse): WeatherVm | null {
    const current = res.current;
    if (!current) return null;

    return {
      temperatureC: current.temperature_2m,
      windKph: current.wind_speed_10m,
      condition: this.describeWeatherCode(current.weather_code),
      asOf: current.time,
    };
  }

  private describeWeatherCode(code?: number): string | undefined {
    if (code === undefined || code === null) return undefined;
    if (code === 0) return 'Clear sky';
    if (code === 1 || code === 2) return 'Mostly clear';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Fog';
    if (code === 51 || code === 53 || code === 55) return 'Drizzle';
    if (code === 56 || code === 57) return 'Freezing drizzle';
    if (code === 61 || code === 63 || code === 65) return 'Rain';
    if (code === 66 || code === 67) return 'Freezing rain';
    if (code === 71 || code === 73 || code === 75) return 'Snow fall';
    if (code === 77) return 'Snow grains';
    if (code === 80 || code === 81 || code === 82) return 'Rain showers';
    if (code === 85 || code === 86) return 'Snow showers';
    if (code === 95) return 'Thunderstorm';
    if (code === 96 || code === 99) return 'Thunderstorm with hail';
    return `Weather code ${code}`;
  }
}
