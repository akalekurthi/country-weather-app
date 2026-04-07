export type OpenMeteoCurrentResponse = {
  latitude: number;
  longitude: number;
  current?: {
    time: string;
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
};

export type WeatherVm = {
  temperatureC?: number;
  windKph?: number;
  condition?: string;
  asOf?: string;
};

