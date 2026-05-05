export const getApiError = (
  err: unknown,
  fallback = "Đã có lỗi xảy ra",
): string => {
  const data = (err as any)?.response?.data;
  return data?.error?.message ?? data?.message ?? fallback;
};
