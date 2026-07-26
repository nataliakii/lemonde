/**
 * Convert Mongo lean docs (ObjectId, Date, Buffer) to JSON-safe plain objects
 * for Next.js Server → Client Component props.
 */
export function toPlain(value) {
  if (value == null) return value;
  return JSON.parse(JSON.stringify(value));
}
