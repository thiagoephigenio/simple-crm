<?php

use App\Models\Invitation;
use Illuminate\Support\Str;

it('is pending when not accepted and not expired', function () {
    $invitation = new Invitation([
        'token' => Str::uuid(),
        'accepted_at' => null,
        'expires_at' => now()->addDays(7),
    ]);

    expect($invitation->isPending())->toBeTrue();
});

it('is not pending when accepted', function () {
    $invitation = new Invitation([
        'token' => Str::uuid(),
        'accepted_at' => now()->subHour(),
        'expires_at' => now()->addDays(7),
    ]);

    expect($invitation->isPending())->toBeFalse();
});

it('is not pending when expired', function () {
    $invitation = new Invitation([
        'token' => Str::uuid(),
        'accepted_at' => null,
        'expires_at' => now()->subDay(),
    ]);

    expect($invitation->isPending())->toBeFalse();
});

it('is not pending when both accepted and expired', function () {
    $invitation = new Invitation([
        'token' => Str::uuid(),
        'accepted_at' => now()->subHour(),
        'expires_at' => now()->subDay(),
    ]);

    expect($invitation->isPending())->toBeFalse();
});
