import { trpcServer } from "$lib/utilities/trpc.server";

export async function load(event) {
  return {
    trpc: await trpcServer.hydrateToClient(event)
  };
}
