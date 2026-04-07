export type RestCountry = {
  cca2: string;
  cca3: string;
  name: { common: string; official?: string };
  flags?: { png?: string; svg?: string; alt?: string };
  region?: string;
  capital?: string[];
  population?: number;
  currencies?: Record<string, { name: string; symbol?: string }>;
  capitalInfo?: { latlng?: [number, number] };
};

export type CountryCardVm = {
  code: string;
  /** ISO 3166-1 alpha-2 (for geocoding / APIs) */
  cca2?: string;
  name: string;
  flagUrl?: string;
  flagAlt?: string;
  region?: string;
  capital?: string;
  population?: number;
  currency?: string;
  latlng?: [number, number];
};

