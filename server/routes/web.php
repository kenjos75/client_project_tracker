<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => 'Client Project Tracker API',
    'endpoints' => '/projects',
]));