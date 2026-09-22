export const THEME_STORAGE_KEY = 'theme'
export const ACCENT_STORAGE_KEY = 'accent'

/**
 * Runs before first paint, from <Head> in _document.js, ahead of any
 * stylesheet. Without it the page paints in light and then snaps to dark.
 *
 * Kept in its own module so _document does not pull the React provider (and
 * its context machinery) into the document bundle just to read one string.
 */
export const THEME_SCRIPT = `(function(){try{
var d=document.documentElement,
t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system',
dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);
d.classList.toggle('dark',dark);
var a=localStorage.getItem('${ACCENT_STORAGE_KEY}');
if(a)d.setAttribute('data-accent',a);
}catch(e){}})();`
    .replace(/\n/g, '')
