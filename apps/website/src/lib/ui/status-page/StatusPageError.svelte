<script lang="ts">
interface Props {
  onRetry: () => void;
}

let { onRetry }: Props = $props();
</script>

<div class="error-container">
  <p class="error-message">データの取得に失敗しました</p>
  <button type="button" class="retry-button" onclick={onRetry}>再試行</button>
</div>

<style>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg) 0;
}

.error-message {
  color: var(--text-muted);
  font-size: var(--text-base);
}

.retry-button {
  background: var(--bg-muted);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-sm);
  cursor: pointer;
}

.retry-button:hover {
  background: var(--border);
}
</style>
