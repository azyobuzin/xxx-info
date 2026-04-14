<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import StatusPageError from "./StatusPageError.svelte";

const { Story } = defineMeta({
  title: "StatusPageError",
  component: StatusPageError,
  parameters: { layout: "padded" },
});
</script>

<Story name="Default" args={{ onRetry: () => alert("Retry clicked") }} />
