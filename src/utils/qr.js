import QRCode from "qrcode";
import { env } from "../lib/env";

const getRuntimeOrigin = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
};

const isLocalhostUrl = (value) =>
  /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);

export const resolvePublicBaseUrl = () => {
  const configuredBaseUrl = env.appBaseUrl.replace(/\/$/, "");
  const runtimeOrigin = getRuntimeOrigin().replace(/\/$/, "");

  if (!configuredBaseUrl && runtimeOrigin) {
    return runtimeOrigin;
  }

  if (isLocalhostUrl(configuredBaseUrl) && runtimeOrigin) {
    const runtimeHost = runtimeOrigin.replace(/^https?:\/\//i, "");

    if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(runtimeHost)) {
      return runtimeOrigin;
    }
  }

  return configuredBaseUrl || runtimeOrigin;
};

export const buildTableMenuUrl = (restaurantId, tableId) =>
  `${resolvePublicBaseUrl()}/menu/${restaurantId}/${tableId}`;

export const generateTableQrCode = async (restaurantId, tableId) =>
  QRCode.toDataURL(buildTableMenuUrl(restaurantId, tableId), {
    margin: 1,
    width: 512,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });
