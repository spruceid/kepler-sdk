export const Blob =
  typeof window == "undefined" ? require("fetch-blob") : window.Blob;
