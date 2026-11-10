// Texts of the page in German, English and Spanish, language detection and applying a language to the DOM
// (DESIGN_SPEC 4, 9; DECISION_REGISTER R57, R58; ACCEPTANCE_CRITERIA E; DESIGN_GUIDELINE 3.2).
// Spanish is default and fallback; navigator.languages may pick German or English at the start. The chosen language
// lives only in this page (no storage, no URL): a reload detects it again. Switching only changes texts – never the
// e-mail input, the chosen card or the code. Brand names (Amazon, MediaMarkt, El Corte Inglés, ULTEBRA) are not
// translated and therefore not in this table. EN and ES are drafts until ULTEBRA approves them (DECISIONS S1).

export const LANGUAGES = Object.freeze(['de', 'en', 'es']);
export const DEFAULT_LANGUAGE = 'es';

// One entry per key, the three languages side by side. The first ten keys are given verbatim by DESIGN_SPEC 4.
export const TEXTS = Object.freeze({
  title: { de: 'Weihnachts-Giftcard', en: 'Christmas gift card', es: 'Tarjeta regalo de Navidad' },
  choose_heading: { de: 'Wähle deine Weihnachts-Giftcard', en: 'Choose your Christmas gift card', es: 'Elige tu tarjeta regalo de Navidad' },
  continue: { de: 'Weiter', en: 'Continue', es: 'Continuar' },
  email_label: { de: 'Deine geschäftliche E-Mail-Adresse', en: 'Your work email address', es: 'Tu correo electrónico de trabajo' },
  generate: { de: 'Code erzeugen', en: 'Generate code', es: 'Generar código' },
  result_heading: { de: 'Dein Auswahlcode ist bereit', en: 'Your selection code is ready', es: 'Tu código de selección está listo' },
  copy: { de: 'Code kopieren', en: 'Copy code', es: 'Copiar código' },
  copied: { de: 'Kopiert', en: 'Copied', es: 'Copiado' },
  back: { de: 'Zurück', en: 'Back', es: 'Atrás' },
  reset: { de: 'Andere Auswahl treffen', en: 'Make another selection', es: 'Elegir otra opción' },

  // Header and progress
  lang_label: { de: 'Sprache', en: 'Language', es: 'Idioma' },
  progress_label: { de: 'Fortschritt', en: 'Progress', es: 'Progreso' },
  step_choose: { de: 'Auswahl', en: 'Selection', es: 'Elección' },
  step_email: { de: 'E-Mail', en: 'Email', es: 'Correo' },
  step_result: { de: 'Code', en: 'Code', es: 'Código' },
  step_done: { de: ', erledigt', en: ', done', es: ', completado' },

  // State A: choose
  choose_eyebrow: { de: 'Frohe Weihnachten', en: 'Merry Christmas', es: 'Feliz Navidad' },
  choose_intro: {
    de: 'Drei Möglichkeiten, ein Geschenk von ULTEBRA. Deine Auswahl wird erst durch den separat übermittelten Code bearbeitet.',
    en: 'Three options, one gift from ULTEBRA. Your selection is only processed once you send the code separately.',
    es: 'Tres opciones, un regalo de ULTEBRA. Tu elección solo se tramita cuando envías el código por separado.',
  },
  card_hint: { de: 'Giftcard auswählen', en: 'Choose gift card', es: 'Elegir tarjeta' },
  card_selected: { de: 'Ausgewählt', en: 'Selected', es: 'Seleccionada' },
  trust: {
    de: 'Lokal im Browser · keine App-Speicherung · kein Login',
    en: 'Local in your browser · no app storage · no login',
    es: 'Local en tu navegador · sin almacenamiento en la app · sin inicio de sesión',
  },

  // State B: e-mail
  email_eyebrow: { de: 'Schritt 2', en: 'Step 2', es: 'Paso 2' },
  email_heading: {
    de: 'Erzeuge deinen persönlichen Auswahlcode',
    en: 'Generate your personal selection code',
    es: 'Genera tu código de selección personal',
  },
  summary_label: { de: 'Deine Auswahl:', en: 'Your selection:', es: 'Tu elección:' },
  change: { de: 'Ändern', en: 'Change', es: 'Cambiar' },
  email_placeholder: { de: 'name@unternehmen.com', en: 'name@company.com', es: 'nombre@empresa.com' },
  email_help: {
    de: 'Sie wird nur in diesem Browser zur Code-Erzeugung verwendet und von dieser Seite nicht gespeichert oder gesendet.',
    en: 'It is only used in this browser to generate the code and is not stored or sent by this page.',
    es: 'Solo se usa en este navegador para generar el código; esta página no lo guarda ni lo envía.',
  },
  email_empty: {
    de: 'Bitte gib deine geschäftliche E-Mail-Adresse ein.',
    en: 'Please enter your work email address.',
    es: 'Introduce tu correo electrónico de trabajo.',
  },
  email_implausible: {
    de: 'Bitte prüfe die E-Mail-Adresse – sie braucht genau ein „@“ und eine Domain wie name@firma.com.',
    en: 'Please check the email address – it needs exactly one “@” and a domain such as name@company.com.',
    es: 'Revisa el correo electrónico: necesita exactamente una «@» y un dominio como nombre@empresa.com.',
  },
  crypto_error: {
    de: 'Diesem Browser fehlt die Funktion, die zur Berechnung des Codes nötig ist (Web Crypto). Bitte öffne die Seite in einem aktuellen Browser wie Firefox, Chrome, Edge oder Safari.',
    en: 'This browser lacks the function needed to compute the code (Web Crypto). Please open the page in a current browser such as Firefox, Chrome, Edge or Safari.',
    es: 'A este navegador le falta la función necesaria para calcular el código (Web Crypto). Abre la página en un navegador actual como Firefox, Chrome, Edge o Safari.',
  },
  email_notice: {
    de: 'Der Code bestätigt keine Identität und verhindert keine Mehrfachauswahl.',
    en: 'The code does not confirm anyone’s identity and does not prevent multiple selections.',
    es: 'El código no confirma ninguna identidad ni impide selecciones múltiples.',
  },

  // State C: result
  result_eyebrow: { de: 'Fertig', en: 'Done', es: 'Listo' },
  result_card_label: { de: 'Gewählte Giftcard:', en: 'Chosen gift card:', es: 'Tarjeta elegida:' },
  code_label: { de: 'Dein Code', en: 'Your code', es: 'Tu código' },
  copy_manual: {
    de: 'Bitte manuell kopieren: Der Code ist markiert.',
    en: 'Please copy manually: the code is selected.',
    es: 'Cópialo manualmente: el código está seleccionado.',
  },
  next_step_label: { de: 'Nächster Schritt:', en: 'Next step:', es: 'Siguiente paso:' },
  next_step_text: {
    de: 'Sende diesen Code über den von ULTEBRA genannten Kanal. Erst die interne Bearbeitung macht deine Auswahl verbindlich.',
    en: 'Send this code through the channel named by ULTEBRA. Your selection only becomes binding once it has been processed internally.',
    es: 'Envía este código por el canal indicado por ULTEBRA. Tu elección solo es definitiva cuando se haya tramitado internamente.',
  },
  result_notice: {
    de: 'Der Code dient der Zuordnung, nicht als Identitäts- oder Sicherheitsnachweis.',
    en: 'The code is used for matching only, not as proof of identity or security.',
    es: 'El código sirve para la asignación, no como prueba de identidad ni de seguridad.',
  },

  // Explanation "How the selection works" (DESIGN_SPEC 9, extended version; DECISIONS S1: EN and ES are drafts)
  explain_title: { de: 'So funktioniert die Auswahl', en: 'How the selection works', es: 'Cómo funciona la selección' },
  explain_local: {
    de: 'Deine E-Mail-Adresse wird nur in deinem Browser verarbeitet, um den Code zu berechnen; diese Seite speichert oder sendet sie nicht. Der Server, auf dem die Seite liegt (GitHub Pages), sieht wie bei jeder Webseite die normalen Seitenaufrufe, aber nie deine E-Mail-Adresse.',
    en: 'Your email address is only processed in your browser to compute the code; this page does not store or send it. The host of the page (GitHub Pages) sees the normal page requests, as with any website, but never your email address.',
    es: 'Tu correo electrónico solo se procesa en tu navegador para calcular el código; esta página no lo guarda ni lo envía. El alojamiento de la página (GitHub Pages) sí ve las solicitudes normales de la página, como ocurre en cualquier sitio web, pero nunca tu correo electrónico.',
  },
  explain_nocheck: {
    de: 'Diese statische Seite besitzt keine Mitarbeiterliste, Datenbank oder Anmeldung. Sie kann nicht feststellen, ob eine E-Mail-Adresse zu einer beschäftigten Person gehört. Der Code ist kein Identitäts- oder Sicherheitsnachweis.',
    en: 'This static page has no employee list, database or login. It cannot tell whether an email address belongs to an employee. The code is not proof of identity or security.',
    es: 'Esta página estática no tiene lista de empleados, base de datos ni inicio de sesión. No puede comprobar si un correo electrónico pertenece a una persona de la plantilla. El código no es una prueba de identidad ni de seguridad.',
  },
  explain_limits: {
    de: 'Die Seite kann Mehrfachauswahlen, nachträgliche Änderungen und Fristen nicht technisch verhindern oder durchsetzen.',
    en: 'The page cannot technically prevent or enforce multiple selections, later changes or deadlines.',
    es: 'La página no puede impedir ni hacer cumplir técnicamente las selecciones múltiples, los cambios posteriores ni los plazos.',
  },
  explain_process: {
    de: 'Sende den Code nur über den von ULTEBRA bekanntgegebenen Kanal. Bei mehreren Einsendungen entscheidet der interne ULTEBRA-Prozess, welche berücksichtigt wird; Änderungen und Fristen regelt ULTEBRA organisatorisch.',
    en: 'Send the code only through the channel announced by ULTEBRA. If several submissions arrive, the internal ULTEBRA process decides which one counts; changes and deadlines are handled by ULTEBRA organisationally.',
    es: 'Envía el código solo por el canal indicado por ULTEBRA. Si se reciben varios envíos, decide el proceso interno de ULTEBRA cuál se tiene en cuenta; los cambios y los plazos los gestiona ULTEBRA de forma organizativa.',
  },

  // Footer: short privacy text (DESIGN_SPEC 9)
  privacy_short: {
    de: 'Deine E-Mail wird in diesem Browser zur Code-Erzeugung verwendet. Diese Seite speichert oder sendet sie nicht. Der Code ist kein Identitäts- oder Sicherheitsnachweis.',
    en: 'Your email is used in this browser to generate the code. This page does not store or send it. The code is not proof of identity or security.',
    es: 'Tu correo electrónico se usa en este navegador para generar el código. Esta página no lo guarda ni lo envía. El código no es una prueba de identidad ni de seguridad.',
  },
});

export function isLanguage(value) {
  return LANGUAGES.includes(value);
}

// Text for a key; an unknown language falls back to Spanish. An unknown key is a programming error.
export function translate(language, key) {
  const entry = TEXTS[key];
  if (!entry) throw new Error(`Unknown text key: ${key}`);
  return entry[isLanguage(language) ? language : DEFAULT_LANGUAGE];
}

// First supported language in the browser's preference list ("de-AT" -> "de"), otherwise Spanish.
export function detectLanguage(preferred) {
  for (const tag of Array.isArray(preferred) ? preferred : []) {
    const primary = String(tag).trim().toLowerCase().split(/[-_]/)[0];
    if (isLanguage(primary)) return primary;
  }
  return DEFAULT_LANGUAGE;
}

// Writes the texts of one language into the page:
//   data-i18n="key"                         -> textContent
//   data-i18n-attr="attribute:key;..."      -> attributes (placeholder, aria-label)
//   .lang__btn[lang]                        -> aria-pressed of the switch
// plus <html lang> and the document title. Input values, selection and code are not touched.
export function applyLanguage(doc, language) {
  const lang = isLanguage(language) ? language : DEFAULT_LANGUAGE;
  doc.documentElement.lang = lang;
  doc.title = `${translate(lang, 'title')} · ULTEBRA`;
  for (const element of doc.querySelectorAll('[data-i18n]')) {
    element.textContent = translate(lang, element.dataset.i18n);
  }
  for (const element of doc.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of element.dataset.i18nAttr.split(';')) {
      const [attribute, key] = pair.split(':').map((part) => part.trim());
      if (attribute && key) element.setAttribute(attribute, translate(lang, key));
    }
  }
  for (const button of doc.querySelectorAll('.lang__btn[lang]')) {
    button.setAttribute('aria-pressed', String(button.getAttribute('lang') === lang));
  }
  return lang;
}
