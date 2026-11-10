// Gift card selection as an ARIA radio group (DESIGN_SPEC 11, DESIGN_GUIDELINE 3.5, 5.2).
// Roving tabindex: exactly one radio is tabbable (the checked one, else the first). Arrow keys move focus and
// check with wrap, Home / End jump, Space checks the focused radio, click checks. No storage, no DOM creation.

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown']);
const PREVIOUS_KEYS = new Set(['ArrowLeft', 'ArrowUp']);

export function createRadioGroup(groupElement, onChange) {
  const radios = Array.from(groupElement.querySelectorAll('[role="radio"]'));

  function checkedIndex() {
    return radios.findIndex((radio) => radio.getAttribute('aria-checked') === 'true');
  }

  function updateTabStops() {
    const tabbable = Math.max(checkedIndex(), 0);
    radios.forEach((radio, index) => {
      radio.tabIndex = index === tabbable ? 0 : -1;
    });
  }

  function check(index, { focus = false } = {}) {
    const previous = checkedIndex();
    radios.forEach((radio, i) => radio.setAttribute('aria-checked', String(i === index)));
    updateTabStops();
    if (focus) radios[index].focus();
    if (previous !== index) onChange(radios[index].dataset.giftcardId);
  }

  function onKeyDown(event) {
    const current = radios.indexOf(event.currentTarget);
    let target = null;
    if (NEXT_KEYS.has(event.key)) target = (current + 1) % radios.length;
    else if (PREVIOUS_KEYS.has(event.key)) target = (current - 1 + radios.length) % radios.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = radios.length - 1;
    else if (event.key === ' ' || event.key === 'Spacebar') target = current;
    if (target === null) return;
    event.preventDefault();
    check(target, { focus: true });
  }

  radios.forEach((radio, index) => {
    radio.addEventListener('click', () => check(index, { focus: true }));
    radio.addEventListener('keydown', onKeyDown);
  });
  updateTabStops();

  return {
    value() {
      const index = checkedIndex();
      return index === -1 ? null : radios[index].dataset.giftcardId;
    },
    clear() {
      radios.forEach((radio) => radio.setAttribute('aria-checked', 'false'));
      updateTabStops();
    },
  };
}
