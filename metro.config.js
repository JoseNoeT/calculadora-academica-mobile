const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [
  ...new Set([...config.resolver.assetExts, "wasm"]),
];
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  (ext) => ext !== "wasm",
);

module.exports = config;
