export function log(message, type = "info") {

  const timestamp = new Date().toLocaleTimeString();

  console.log(`[${type.toUpperCase()}] ${timestamp} - ${message}`);

  return {
    type,
    message,
    timestamp
  };
}