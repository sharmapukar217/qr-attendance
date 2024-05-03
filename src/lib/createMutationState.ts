import { notifyManager, replaceEqualDeep } from "@tanstack/query-core";
import { readable, type Readable } from "svelte/store";
import { useQueryClient } from "@tanstack/svelte-query";
import type {
  Mutation,
  QueryClient,
  DefaultError,
  MutationCache,
  MutationState,
  MutationFilters
} from "@tanstack/svelte-query";

type MutationStateOptions<TResult = MutationState> = {
  filters?: MutationFilters;
  select?: (mutation: Mutation<unknown, DefaultError, unknown, unknown>) => TResult;
};

function getResult<TResult = MutationState>(
  mutationCache: MutationCache,
  options: MutationStateOptions<TResult>
): Array<TResult> {
  return mutationCache
    .findAll(options.filters)
    .map(
      (mutation): TResult =>
        (options.select
          ? options.select(mutation as Mutation<unknown, DefaultError, unknown, unknown>)
          : mutation.state) as TResult
    );
}

export function createMutationState<TResult = MutationState>(
  options: MutationStateOptions<TResult> = {},
  queryClient?: QueryClient
): Readable<Array<TResult>> {
  const client = useQueryClient(queryClient);
  const mutationCache = client.getMutationCache();

  let result = getResult(mutationCache, options);

  const { subscribe } = readable(result, (set) => {
    return mutationCache.subscribe(
      notifyManager.batchCalls(() => {
        const nextResult = replaceEqualDeep(result, getResult(mutationCache, options));
        if (result !== nextResult) {
          result = nextResult;
          set(result);
        }
      })
    );
  });

  //   notifyManager.batchCalls(() => {
  //     const nextResult = replaceEqualDeep(result, getResult(mutationCache, options));
  //     if (result !== nextResult) {
  //       result = nextResult;
  //       set(result);
  //     }
  //   })
  return { subscribe };
}
