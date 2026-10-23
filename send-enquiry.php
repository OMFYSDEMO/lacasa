<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    reply(405, 'Please submit the enquiry form.');
}
function field(string $key, int $max = 3000): string {
    $value = $_POST[$key] ?? '';
    if (!is_string($value) || strlen($value) > $max) {
        reply(422, 'Please check the form fields and try again.');
    }
    return trim($value);
}
$token = field('csrf', 128);
if (empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $token)) {
    reply(403, 'Your session expired. Refresh this page and try again.');
}
if (field('website', 200) !== '') reply(422, 'Unable to submit this enquiry.');
if (time() - ($_SESSION['last_sent'] ?? 0) < 60) reply(429, 'Please wait one minute before sending another enquiry.');
$name = field('name', 100);
$email = field('email', 200);
$phone = field('phone', 40);
$room = field('room', 80);
$guests = field('guests', 2);
$arrival = field('arrival', 10);
$departure = field('departure', 10);
$message = field('message', 3000);
if ($name === '' || preg_match('/[\r\n]/', $name . $email . $phone) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(422, 'Please enter a valid name and email address.');
}
if (!in_array($room, ['Standard Double', 'Deluxe Family', 'Not sure yet'], true) || !in_array($guests, ['1','2','3','4','5','6'], true)) {
    reply(422, 'Please choose a room and number of guests.');
}
$in = DateTimeImmutable::createFromFormat('!Y-m-d', $arrival);
$out = DateTimeImmutable::createFromFormat('!Y-m-d', $departure);
if (!$in || !$out || $in->format('Y-m-d') !== $arrival || $out->format('Y-m-d') !== $departure || $in < new DateTimeImmutable('today') || $out <= $in) {
    reply(422, 'Choose an arrival date from today onward and a departure after arrival.');
}
if (field('consent', 1) !== '1') reply(422, 'Please agree to the use of your details to respond to this enquiry.');
// Set these in the hosting environment. Never use a visitor address as From.
$recipient = getenv('LACASA_ENQUIRY_TO') ?: 'lacasatvm@gmail.com';
$sender = getenv('LACASA_ENQUIRY_FROM') ?: '';
if (preg_match('/[\r\n]/', $recipient . $sender) || !filter_var($recipient, FILTER_VALIDATE_EMAIL) || !filter_var($sender, FILTER_VALIDATE_EMAIL)) {
    reply(503, 'Email enquiries are not configured yet. Please call +91 97469 98998 or WhatsApp the hosts.');
}
$text = "New Lacasa availability enquiry\n\nName: $name\nEmail: $email\nPhone: $phone\nRoom: $room\nGuests: $guests\nArrival: $arrival\nDeparture: $departure\n\nMessage:\n$message\n\nConsent: visitor agreed to contact about this enquiry.\n";
$headers = ['From' => $sender, 'Reply-To' => $email, 'Content-Type' => 'text/plain; charset=UTF-8', 'MIME-Version' => '1.0'];
if (!mail($recipient, 'Lacasa stay enquiry', $text, $headers)) {
    reply(502, 'Your enquiry could not be sent. Please call or WhatsApp the hosts.');
}
$_SESSION['last_sent'] = time();
reply(200, 'Your enquiry has been accepted for delivery. The hosts will reply personally. Your booking is not yet confirmed.');
