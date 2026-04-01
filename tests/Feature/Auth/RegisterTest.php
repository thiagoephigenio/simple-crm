<?php

use App\Models\User;

it('renders the register page', function () {
    $this->get(route('register'))->assertOk();
});

it('redirects authenticated users away from register', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('register'))
        ->assertRedirect();
});

it('registers a new user and redirects to onboarding', function () {
    $this->post(route('register'), [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])
        ->assertRedirect(route('onboarding'));

    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
});

it('requires name', function () {
    $this->post(route('register'), [
        'email' => 'john@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertInvalid(['name']);
});

it('requires a valid email', function () {
    $this->post(route('register'), [
        'name' => 'John Doe',
        'email' => 'not-an-email',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertInvalid(['email']);
});

it('requires unique email', function () {
    User::factory()->create(['email' => 'john@example.com']);

    $this->post(route('register'), [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertInvalid(['email']);
});

it('requires password confirmation to match', function () {
    $this->post(route('register'), [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password',
        'password_confirmation' => 'wrong',
    ])->assertInvalid(['password']);
});
