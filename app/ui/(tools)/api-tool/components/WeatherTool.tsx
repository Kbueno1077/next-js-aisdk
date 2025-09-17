import { WeatherToolPart } from "./types";

interface WeatherToolProps {
  part: WeatherToolPart;
  messageId: string;
  index: number;
}

const getWeatherIcon = (conditionCode: number) => {
  const iconMap: Record<number, string> = {
    1000: "☀️", // Clear
    1003: "⛅", // Partly cloudy
    1006: "☁️", // Cloudy
    1009: "☁️", // Overcast
    1030: "🌫️", // Mist
    1063: "🌦️", // Patchy rain
    1066: "🌨️", // Patchy snow
    1069: "🌨️", // Patchy sleet
    1087: "⛈️", // Thundery outbreaks
    1114: "🌨️", // Blowing snow
    1117: "❄️", // Blizzard
    1135: "🌫️", // Fog
    1147: "🌫️", // Freezing fog
    1150: "🌧️", // Patchy light drizzle
    1153: "🌧️", // Light drizzle
    1168: "🌧️", // Heavy drizzle
    1171: "🌧️", // Heavy drizzle
    1180: "🌧️", // Slight rain
    1183: "🌧️", // Light rain
    1186: "🌧️", // Moderate rain
    1189: "🌧️", // Heavy rain
    1192: "🌧️", // Heavy rain
    1195: "🌧️", // Heavy rain
    1225: "🌨️", // Heavy snow
    1255: "🌨️", // Light sleet
    1258: "🌨️", // Moderate/heavy sleet
    1261: "🌨️", // Light snow
    1264: "🌨️", // Moderate snow
    1273: "🌨️", // Patchy light rain with thunder
    1276: "⛈️", // Moderate/heavy rain with thunder
  };

  return iconMap[conditionCode] || "🌤️";
};

const getWeatherBackground = (conditionCode: number, temp: number) => {
  if (temp < 0) return "from-blue-50 to-blue-100 border-blue-200";
  if (temp < 10) return "from-cyan-50 to-cyan-100 border-cyan-200";
  if (temp < 20) return "from-green-50 to-green-100 border-green-200";
  if (temp < 25) return "from-yellow-50 to-yellow-100 border-yellow-200";
  if (temp < 30) return "from-orange-50 to-orange-100 border-orange-200";
  return "from-red-50 to-red-100 border-red-200";
};

const formatLocalTime = (localtime: string) => {
  const date = new Date(localtime);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export function WeatherTool({ part, messageId, index }: WeatherToolProps) {
  switch (part.state) {
    case "input-streaming":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-base font-semibold text-amber-800">
                🌤️ Processing Weather Request
              </span>
            </div>
            <div className="space-y-3">
              <p className="text-amber-700 text-sm">
                Receiving weather request for{" "}
                <span className="font-bold text-amber-900">
                  {part.input?.city}
                </span>
              </p>
              <div className="bg-amber-100/50 rounded-lg p-3 border border-amber-200">
                <pre className="text-xs text-amber-800 overflow-x-auto">
                  {JSON.stringify(part.input, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      );

    case "input-available":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-base font-semibold text-blue-800">
                🌍 Fetching Weather Data
              </span>
            </div>
            <p className="text-blue-700 text-sm">
              Getting weather for{" "}
              <span className="font-bold text-blue-900">
                {part.input?.city}
              </span>
              ...
            </p>
          </div>
        </div>
      );

    case "output-available":
      const weatherIcon = getWeatherIcon(
        part.output?.current.condition.code || 1000
      );
      const backgroundClass = getWeatherBackground(
        part.output?.current.condition.code || 1000,
        part.output?.current.temp_c || 20
      );

      return (
        <div className="mt-3 first:mt-0">
          <div
            className={`bg-gradient-to-br ${backgroundClass} rounded-xl p-6 shadow-lg border-2`}
          >
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">🕐</span>
                <p className="text-sm text-gray-600 font-medium">
                  {formatLocalTime(part.output?.location.localtime || "")}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{weatherIcon}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {part.output?.location.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {part.output?.location.country}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">
                  {part.output?.current.temp_c}°C
                </div>
                <div className="text-sm text-gray-600">
                  {part.output?.current.condition.text}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/30">
              <p className="text-xs text-gray-600 text-center">
                Weather data provided by WeatherAPI.com
              </p>
            </div>
          </div>
        </div>
      );

    case "output-error":
      return (
        <div className="mt-3 first:mt-0">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-base font-semibold text-red-800">
                ❌ Weather Request Failed
              </span>
            </div>
            <div className="bg-red-100/50 rounded-lg p-3 border border-red-200">
              <p className="text-red-700 text-sm">{part.errorText}</p>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
