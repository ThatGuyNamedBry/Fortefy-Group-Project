// The server hands us a CSRF token in a readable cookie and expects it back in
// the X-CSRFToken header on anything that changes state. The browser attaches
// the cookie to cross-site requests on its own, so the cookie alone proves
// nothing; another origin cannot read it to set the header, so the header does.
export const csrfToken = () => {
	const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
	return match ? decodeURIComponent(match[1]) : "";
};

// Headers for a request that changes something on the server. Pass the headers
// the request already needs and this adds the token to them.
export const csrfHeaders = (headers = {}) => ({
	...headers,
	"X-CSRFToken": csrfToken(),
});
