/**
 * Application entry point.
 *
 * For now this only proves the TypeScript module graph is wired to the page.
 * Phase 1 replaces it with the Bazi landing experience.
 */

const statusEl = document.querySelector<HTMLElement>('[data-scaffold-status]')

if (statusEl) {
  statusEl.textContent = 'TypeScript entry point is live.'
  statusEl.dataset.ok = 'true'
}
