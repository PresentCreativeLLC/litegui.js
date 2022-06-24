/*
 *Hconst noop = () => {};
 *Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });
 */
window.scrollTo = (x, y) =>
{
	document.documentElement.scrollTop = y;
};