export const normalizeExternalUrl = (value) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const withProtocol = /^[a-z]+:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    return new URL(withProtocol).toString();
  } catch {
    throw new Error("Enter a valid public URL.");
  }
};
