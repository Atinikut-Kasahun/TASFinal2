<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Applicant;
use Illuminate\Http\Request;

$admin = User::whereHas('roles', fn($q) => $q->where('slug', 'admin'))->first();

if (!$admin) {
    die("No admin user found\n");
}

Auth::login($admin);

$request = Request::create('/api/v1/applicants?status=', 'GET');
$request->setUserResolver(fn() => $admin);

$controller = new App\Http\Controllers\ApplicantController();
$response = $controller->index($request);

echo "Response Status: " . $response->getStatusCode() . "\n";
$data = json_decode($response->getContent(), true);
echo "Total Applicants in response: " . ($data['total'] ?? 'N/A') . "\n";
echo "Data count: " . count($data['data'] ?? []) . "\n";
if (isset($data['data'][0])) {
    echo "First applicant name: " . $data['data'][0]['name'] . "\n";
}
