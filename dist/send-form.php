<?php
/**
 * Provigood website forms: e-mails a contact or testimonial submission to
 * sales@provigood.com, sent from the Gandi hosting with PHP's mail().
 * No third-party service, no account, no key.
 *
 * script.js posts JSON here:
 *   { "form": "contact" | "testimonial", "subject": "...", "email": "...",
 *     "fields": { "Label": "value", ... }, "botcheck": true (bots only) }
 * and expects { "success": true } back.
 *
 * The recipient is fixed below and never read from the request, so this
 * script cannot be used to send mail to anyone else.
 */

declare(strict_types=1);

const RECIPIENT = 'sales@provigood.com';
const SENDER = 'website@provigood.com';
const SENDER_NAME = 'Provigood website';

const MAX_BODY_BYTES = 64000;
const MAX_FIELDS = 30;
const MAX_LABEL_CHARS = 60;
const MAX_VALUE_CHARS = 5000;
const MAX_SUBJECT_CHARS = 150;

// At most RATE_LIMIT messages from one IP address per RATE_WINDOW seconds
const RATE_LIMIT = 5;
const RATE_WINDOW = 600;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function reply(int $status, bool $success): void
{
    http_response_code($status);
    echo json_encode(['success' => $success]);
    exit;
}

// Strips control characters and trims to length. Multi-line values keep
// their line breaks and tabs; single-line values (labels, subject) lose them,
// which also rules out header injection.
function clean($value, int $maxChars, bool $multiline): string
{
    $text = str_replace(["\r\n", "\r"], "\n", (string) $value);
    $pattern = $multiline ? '/[\x00-\x08\x0B-\x1F\x7F]/u' : '/[\x00-\x1F\x7F]/u';
    $text = preg_replace($pattern, $multiline ? '' : ' ', $text);
    if ($text === null) {
        return ''; // not valid UTF-8
    }
    return trim(mb_substr($text, 0, $maxChars, 'UTF-8'));
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, false);
}

// Only accept submissions made from the site's own pages
$host = preg_replace('/[^a-z0-9.\-]/i', '', preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && strcasecmp((string) parse_url($origin, PHP_URL_HOST), $host) !== 0) {
    reply(403, false);
}

$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
    reply(413, false);
}
$data = json_decode($raw, true);
if (!is_array($data)) {
    reply(400, false);
}

// Hidden honeypot box ticked: a bot. Answer as if sent so it does not retry.
if (!empty($data['botcheck'])) {
    reply(200, true);
}

$form = $data['form'] ?? '';
if (!in_array($form, ['contact', 'testimonial'], true)) {
    reply(400, false);
}

$email = trim((string) ($data['email'] ?? ''));
if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    reply(422, false);
}

$fields = $data['fields'] ?? null;
if (!is_array($fields) || count($fields) > MAX_FIELDS) {
    reply(400, false);
}

$lines = [];
foreach ($fields as $label => $value) {
    if (!is_string($label) || !is_scalar($value)) {
        continue;
    }
    $label = clean($label, MAX_LABEL_CHARS, false);
    $value = clean($value, MAX_VALUE_CHARS, true);
    if ($label === '' || $value === '') {
        continue;
    }
    $lines[] = strpos($value, "\n") === false ? "$label: $value" : "$label:\n$value\n";
}
if (!$lines) {
    reply(400, false);
}

$stampFile = sys_get_temp_dir() . '/provigood-form-' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '');
$now = time();
$recent = [];
if (is_readable($stampFile)) {
    foreach (file($stampFile, FILE_IGNORE_NEW_LINES) ?: [] as $stamp) {
        if ((int) $stamp > $now - RATE_WINDOW) {
            $recent[] = (int) $stamp;
        }
    }
}
if (count($recent) >= RATE_LIMIT) {
    reply(429, false);
}

$subject = clean($data['subject'] ?? '', MAX_SUBJECT_CHARS, false);
if ($subject === '') {
    $subject = $form === 'contact' ? 'Provigood inquiry' : 'Provigood testimonial';
}

$body = implode("\n", $lines)
    . "\n\n-- \nSent from the " . $form . ' form on ' . ($host !== '' ? $host : 'provigood.com') . ".\n"
    . 'Reply to this e-mail to answer ' . $email . " directly.\n";

// Base64 body: safe for accents and long lines. Reply-To is the visitor,
// so answering the e-mail writes straight back to them.
$sent = mail(
    RECIPIENT,
    mb_encode_mimeheader($subject, 'UTF-8', 'B'),
    chunk_split(base64_encode($body)),
    [
        'From' => SENDER_NAME . ' <' . SENDER . '>',
        'Reply-To' => $email,
        'MIME-Version' => '1.0',
        'Content-Type' => 'text/plain; charset=UTF-8',
        'Content-Transfer-Encoding' => 'base64',
    ],
    '-f' . SENDER
);
if (!$sent) {
    reply(502, false);
}

$recent[] = $now;
@file_put_contents($stampFile, implode("\n", $recent), LOCK_EX);

reply(200, true);
