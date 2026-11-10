// Copy the code (R25, DESIGN_SPEC 3 C, 10; DESIGN_GUIDELINE 3.10, 3.11).
// Success: button label "Kopiert" and a spoken status line for at least 2 s. No clipboard or refused: the code is
// focused and selected and "Bitte manuell kopieren" is announced. Nothing is stored or logged.

const COPIED_VISIBLE_MS = 2500;
const RE_ANNOUNCE_MS = 60;

export function selectText(element) {
  const selection = globalThis.getSelection?.();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function createCopyControl({ button, label, codeElement, okLine, manualLine, texts }) {
  let timer = null;
  let announceTimer = null;

  function stopTimers() {
    clearTimeout(timer);
    clearTimeout(announceTimer);
    timer = null;
    announceTimer = null;
  }

  function reset() {
    stopTimers();
    label.textContent = texts.copy;
    okLine.hidden = true;
    manualLine.hidden = true;
  }

  function showCopied() {
    stopTimers();
    manualLine.hidden = true;
    // Hide first and show again shortly after, so a repeated copy is announced again by the live region.
    okLine.hidden = true;
    announceTimer = setTimeout(() => {
      okLine.hidden = false;
    }, RE_ANNOUNCE_MS);
    label.textContent = texts.copied;
    timer = setTimeout(() => {
      label.textContent = texts.copy;
      okLine.hidden = true;
    }, COPIED_VISIBLE_MS);
  }

  function showManual() {
    stopTimers();
    label.textContent = texts.copy;
    okLine.hidden = true;
    manualLine.hidden = false;
    codeElement.focus();
    selectText(codeElement);
  }

  async function copy() {
    const text = codeElement.textContent;
    const clipboard = globalThis.navigator?.clipboard;
    if (!text || typeof clipboard?.writeText !== 'function') {
      showManual();
      return;
    }
    try {
      await clipboard.writeText(text);
      showCopied();
    } catch {
      showManual();
    }
  }

  button.addEventListener('click', copy);
  return { reset };
}
