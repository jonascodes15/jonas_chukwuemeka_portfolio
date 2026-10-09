/**
 * Runs during HTML parsing, before first paint, so the page never flashes the wrong theme.
 * Order of precedence: the visitor's saved choice, then their system preference.
 */
export const THEME_STORAGE_KEY = "theme";

const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
