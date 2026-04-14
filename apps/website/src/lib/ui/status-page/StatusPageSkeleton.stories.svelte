<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import StatusPageSkeleton from "./StatusPageSkeleton.svelte";

const { Story } = defineMeta({
  title: "StatusPageSkeleton",
  component: StatusPageSkeleton,
  parameters: { layout: "padded" },
});
</script>

<Story name="Default" />
