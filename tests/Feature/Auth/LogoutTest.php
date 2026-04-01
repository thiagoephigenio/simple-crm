<?php

use App\Models\User;

it('logs out authenticated user and redirects to login', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('logout'))
        ->assertRedirect(route('login'));

    $this->assertGuest();
});

it('invalidates the session on logout', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $sessionId = session()->getId();

    $this->post(route('logout'));

    expect(session()->getId())->not->toBe($sessionId);
});

it('requires authentication to logout', function () {
    $this->post(route('logout'))->assertRedirect(route('login'));
});
