<script lang="ts">
import { createInstanceStatusQuery } from "$lib/api";
import StatusPage from "$lib/ui/status-page/StatusPage.svelte";
import StatusPageError from "$lib/ui/status-page/StatusPageError.svelte";
import StatusPageSkeleton from "$lib/ui/status-page/StatusPageSkeleton.svelte";

const query = createInstanceStatusQuery();
</script>

<svelte:head><title>ご隠居 ステータス</title></svelte:head>

{#if query.isPending}
  <StatusPageSkeleton />
{:else if query.isError}
  <StatusPageError onRetry={() => query.refetch()} />
{:else}
  <StatusPage data={query.data} />
{/if}
