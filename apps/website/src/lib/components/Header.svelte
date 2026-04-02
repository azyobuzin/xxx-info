<script lang="ts">
import { page } from "$app/state";

const navLinks = [
  { href: "/", label: "Info" },
  { href: "/status", label: "Status" },
];
</script>

<header>
  <div class="title">ご隠居</div>
  <nav>
    <div class="nav-left">
      {#each navLinks as link (link.href)}
        <a
          href={link.href}
          aria-current={page.url.pathname === link.href ? "page" : undefined}
        >
          {link.label}
        </a>
      {/each}
    </div>
    <a href="https://xxx.azyobuzi.net/" class="nav-external">ご隠居へ</a>
  </nav>
</header>

<style>
header {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: var(--space-md) var(--space-md) 0;
}

.title {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-sm);
}

nav {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border);
}

.nav-left {
  display: flex;
  gap: var(--space-md);
}

nav a {
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-decoration: none;
  padding-bottom: var(--space-sm);
  border-bottom: 2px solid transparent;
  margin-bottom: calc(-1 * var(--space-sm) - 1px);
}

nav a:hover {
  color: var(--text);
}

nav a[aria-current="page"] {
  color: var(--text);
  font-weight: 500;
  border-bottom-color: var(--text);
}

.nav-external {
  margin-left: auto;
}
</style>
