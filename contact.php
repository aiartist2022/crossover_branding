<?php
// Contact form handler for Hostinger (PHP shared hosting). Emails each enquiry to the Hostinger mailbox.
// Edit TO / FROM below if the mailbox changes. FROM must be a mailbox on the domain hosting this site,
// otherwise mail providers may treat the message as spam. No secrets are stored here.
const TO   = 'purvak@crossoverproductions.ae';
const FROM = 'purvak@crossoverproductions.ae';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function done(int $code, string $msg): void {
    http_response_code($code);
    echo json_encode(['ok' => $code === 200, 'message' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') done(405, 'Method not allowed.');

// Honeypot: real visitors never fill this hidden field.
if (!empty($_POST['website'])) done(200, 'Thanks — your message has been sent.');

// Light rate limit: one submission per IP every 30 seconds.
$ipFile = sys_get_temp_dir() . '/cb_form_' . md5($_SERVER['REMOTE_ADDR'] ?? '');
if (is_file($ipFile) && time() - filemtime($ipFile) < 30) done(429, 'Please wait a moment before sending again.');

function field(string $k, int $max): string {
    $v = trim((string)($_POST[$k] ?? ''));
    $v = preg_replace('/[\r\n]+/', ' ', $v); // no line breaks => no header injection
    return mb_substr($v, 0, $max);
}

$name = field('name', 120);
$org  = field('organization', 160);
$mail = field('email', 200);
$src  = field('source', 200);
$bud  = field('budget', 120);
$msg  = mb_substr(trim((string)($_POST['message'] ?? '')), 0, 5000);

if ($name === '' || $org === '' || $msg === '' || !filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    done(422, 'Please fill in the required fields.');
}

$body = "Name: $name\nOrganization: $org\nEmail: $mail\nHeard about us: " . ($src ?: '-')
      . "\nBudget: " . ($bud ?: '-') . "\n\n$msg\n";
$subject = '=?UTF-8?B?' . base64_encode("Website enquiry — $org") . '?=';
$headers = [
    'From: Crossover Website <' . FROM . '>',
    'Reply-To: ' . $name . ' <' . $mail . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: crossover-contact-form',
];
// Encode the display name safely in Reply-To.
$headers[1] = 'Reply-To: =?UTF-8?B?' . base64_encode($name) . '?= <' . $mail . '>';

if (!mail(TO, $subject, $body, implode("\r\n", $headers), '-f' . FROM)) {
    done(500, 'Sorry, we could not send your message. Please email us directly.');
}
@touch($ipFile);
done(200, 'Thanks — your message has been sent. We will be in touch soon.');
