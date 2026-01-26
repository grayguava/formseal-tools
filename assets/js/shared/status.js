export function showStatus(el, text) {
  if (!el) return;
  el.textContent = text;
  el.classList.add("visible");
}

export function clearStatus(el) {
  if (!el) return;
  el.textContent = "";
  el.classList.remove("visible");
}
