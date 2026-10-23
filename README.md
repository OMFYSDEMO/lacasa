# Lacasa multipage website

Converted from the supplied “La Casa Home v2” design. Five standalone HTML pages share CSS, JavaScript and the supplied local photos. No framework or build step is required.

## Hosting

1. Upload this folder’s contents to a PHP-enabled web root (PHP 8.1 or later).
2. Enquiries are addressed to `lacasatvm@gmail.com`. You can override this with `LACASA_ENQUIRY_TO`. Set `LACASA_ENQUIRY_FROM` to a valid sending address on your hosting domain; the sender address still needs hosting configuration.
3. Enable your provider’s PHP `mail()` transport and configure the domain’s delivery authentication with the provider. If your host requires authenticated SMTP, connect its supported mail library or transport before launch.
4. Use HTTPS. PHP sessions must be enabled and writable by the web server.
5. Test the contact form and confirm receipt in the destination inbox. A successful response means the mail transport accepted the email; it cannot guarantee inbox delivery. Missing configuration returns a clear error with the phone/WhatsApp alternative.

For local testing with PHP installed: `php -S localhost:8080 -t .` from this folder, then visit http://localhost:8080. Opening HTML files directly previews the design, but the form requires a PHP server.

## Pages

- `index.html`: complete homepage
- `our-home.html`: home story and daily life
- `rooms.html`: room types and supplied starting prices
- `around.html`: neighbourhood and map link
- `contact.html`: stay enquiry form

The handler validates all fields server-side, checks dates and consent, uses session CSRF protection, includes a honeypot, and limits repeated successful submissions per session. For a public production site, add host-level rate limiting. No enquiry details are saved in a publicly accessible file. Email messages are retained according to your mail provider’s policies.

Before launch, confirm the supplied prices, review counts, certification, address and photographs with the property owner. Copy and factual claims come from the supplied design, not independent verification. The supplied PNGs are preserved at full quality. Fonts load from Google Fonts, with local serif/sans-serif fallbacks.

## Editing

Edit text directly in the HTML pages, shared styling in `styles.css`, browser form behavior in `site.js`, and delivery in `send-enquiry.php`. Shared header/footer edits should be applied to all five pages.

## Validation limitations

The delivery package was checked for unresolved source-template syntax, local links, assets, page structure and JavaScript syntax. PHP was not installed in the conversion environment, so PHP execution and actual email delivery require verification on your hosting account.
