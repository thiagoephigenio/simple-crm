<?php

use App\Models\User;

it('renders the login page', function () {
    $this->get(route('login'))->assertOk();
});

it('redirects authenticated users away from login', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('login'))
        ->assertRedirect();
});

it('logs in with valid credentials and redirects to dashboard', function () {
    $user = User::factory()->create(['password' => bcrypt('password')]);

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($user);
});

it('rejects invalid credentials', function () {
    User::factory()->create(['email' => 'user@example.com']);

    $this->post(route('login'), [
        'email' => 'user@example.com',
        'password' => 'wrong-password',
    ])->assertInvalid(['email']);

    $this->assertGuest();
});

it('requires email', function () {
    $this->post(route('login'), [
        'password' => 'password',
    ])->assertInvalid(['email']);
});

it('requires password', function () {
    $this->post(route('login'), [
        'email' => 'user@example.com',
    ])->assertInvalid(['password']);
});

it('requires a valid email format', function () {
    $this->post(route('login'), [
        'email' => 'not-an-email',
        'password' => 'password',
    ])->assertInvalid(['email']);
});

it('regenerates the session on login', function () {
    $user = User::factory()->create(['password' => bcrypt('password')]);
    $sessionId = session()->getId();

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    expect(session()->getId())->not->toBe($sessionId);
});
