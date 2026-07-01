export * from "./generated/api";
export * from "./generated/api.schemas";
export { setBaseUrl, setAuthTokenGetter } from "./custom-fetch";
export type { AuthTokenGetter } from "./custom-fetch";

import { useMutation } from "@tanstack/react-query";
import type { UseMutationOptions, UseMutationResult, MutationFunction } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import type { ErrorType } from "./custom-fetch";

// ─── Delete Registration ──────────────────────────────────────────────────────

export const deleteRegistration = async (id: number, options?: RequestInit): Promise<void> => {
  return customFetch<void>(`/api/registrations/${id}`, { ...options, method: "DELETE" });
};

export const getDeleteRegistrationMutationOptions = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<void, TError, { id: number }, TContext>; request?: RequestInit }
): UseMutationOptions<void, TError, { id: number }, TContext> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};
  const mutationFn: MutationFunction<void, { id: number }> = ({ id }) =>
    deleteRegistration(id, requestOptions);
  return { mutationFn, ...mutationOptions };
};

export function useDeleteRegistration<TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<void, TError, { id: number }, TContext>; request?: RequestInit }
): UseMutationResult<void, TError, { id: number }, TContext> {
  return useMutation(getDeleteRegistrationMutationOptions(options));
}

// ─── Bulk Remind Registrations ────────────────────────────────────────────────

export const bulkRemindRegistrations = async (
  ids: number[],
  options?: RequestInit
): Promise<{ sent: number; failed: number }> => {
  return customFetch<{ sent: number; failed: number }>(`/api/registrations/bulk-remind`, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    body: JSON.stringify({ ids }),
  });
};

export const getBulkRemindRegistrationsMutationOptions = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<{ sent: number; failed: number }, TError, { ids: number[] }, TContext>; request?: RequestInit }
): UseMutationOptions<{ sent: number; failed: number }, TError, { ids: number[] }, TContext> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};
  const mutationFn: MutationFunction<{ sent: number; failed: number }, { ids: number[] }> = ({ ids }) =>
    bulkRemindRegistrations(ids, requestOptions);
  return { mutationFn, ...mutationOptions };
};

export function useBulkRemindRegistrations<TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<{ sent: number; failed: number }, TError, { ids: number[] }, TContext>; request?: RequestInit }
): UseMutationResult<{ sent: number; failed: number }, TError, { ids: number[] }, TContext> {
  return useMutation(getBulkRemindRegistrationsMutationOptions(options));
}

// ─── Reorder Sponsors ─────────────────────────────────────────────────────────

export const reorderSponsors = async (
  items: { id: number; sortOrder: number }[],
  options?: RequestInit
): Promise<{ ok: boolean }> => {
  return customFetch<{ ok: boolean }>(`/api/sponsors/reorder`, {
    ...options,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    body: JSON.stringify(items),
  });
};

export const getReorderSponsorsMutationOptions = <TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<{ ok: boolean }, TError, { items: { id: number; sortOrder: number }[] }, TContext>; request?: RequestInit }
): UseMutationOptions<{ ok: boolean }, TError, { items: { id: number; sortOrder: number }[] }, TContext> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};
  const mutationFn: MutationFunction<{ ok: boolean }, { items: { id: number; sortOrder: number }[] }> = ({ items }) =>
    reorderSponsors(items, requestOptions);
  return { mutationFn, ...mutationOptions };
};

export function useReorderSponsors<TError = ErrorType<unknown>, TContext = unknown>(
  options?: { mutation?: UseMutationOptions<{ ok: boolean }, TError, { items: { id: number; sortOrder: number }[] }, TContext>; request?: RequestInit }
): UseMutationResult<{ ok: boolean }, TError, { items: { id: number; sortOrder: number }[] }, TContext> {
  return useMutation(getReorderSponsorsMutationOptions(options));
}
