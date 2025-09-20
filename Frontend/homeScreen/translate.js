// translate.js

function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en'
  }, 'google_translate_element');
}

// This function sets the Google Translate cookie to an expired date, effectively deleting it.
function clearGoogleTranslateCookie() {
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + window.location.hostname;
}

// When the user reloads or leaves the page, run the function to clear the cookie.
window.addEventListener('beforeunload', function() {
  clearGoogleTranslateCookie();
});
