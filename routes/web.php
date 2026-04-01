<?php

use App\Http\Controllers\Auth\InvitationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);

    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    Route::get('/invitations/{token}', [InvitationController::class, 'show'])->name('invitations.show');
    Route::post('/invitations/{token}/accept', [InvitationController::class, 'accept'])->name('invitations.accept');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LogoutController::class, 'destroy'])->name('logout');

    Route::get('/onboarding', [OnboardingController::class, 'create'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'store']);

    Route::middleware('has.organization')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

        Route::post('/invitations', [InvitationController::class, 'store'])->name('invitations.store');

        Route::get('/team', [TeamController::class, 'index'])->name('team.index');
        Route::patch('/team/{user}', [TeamController::class, 'update'])->name('team.update');
        Route::delete('/team/{user}', [TeamController::class, 'destroy'])->name('team.destroy');
        Route::post('/team/invitations/{invitation}/resend', [TeamController::class, 'resendInvitation'])->name('team.invitations.resend');
        Route::delete('/team/invitations/{invitation}', [TeamController::class, 'destroyInvitation'])->name('team.invitations.destroy');
    });
});
