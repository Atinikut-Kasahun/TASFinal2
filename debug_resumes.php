<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Applicant;

$applicants = Applicant::whereNotNull('resume_path')->get(['id', 'name', 'resume_path']);
$out = "";
foreach ($applicants as $a) {
    $out .= "ID: {$a->id}, Name: {$a->name}\n";
    $out .= "Path: " . $a->resume_path . "\n";
    $out .= "Hex: " . bin2hex($a->resume_path) . "\n\n";
}
file_put_contents('debug_output.txt', $out);
echo "Debug data written to debug_output.txt\n";
