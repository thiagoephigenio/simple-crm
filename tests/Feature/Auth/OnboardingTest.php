<?php

use App\Models\Organization;
use App\Models\User;

it('renders the onboarding page for users without an organization', function () {
    $user = User::factory()->create(['current_organization_id' => null]);

    $this->actingAs($user)
        ->get(route('onboarding'))
        ->assertOk();
});

it('redirects to dashboard if user already has an organization', function () {
    $org = Organization::factory()->create();
    $user = User::factory()->create(['current_organization_id' => $org->id]);

    $this->actingAs($user)
        ->get(route('onboarding'))
        ->assertRedirect(route('dashboard'));
});

it('requires authentication to access onboarding', function () {
    $this->get(route('onboarding'))->assertRedirect(route('login'));
});

it('creates an organization and redirects to dashboard', function () {
    $user = User::factory()->create(['current_organization_id' => null]);

    $this->actingAs($user)
        ->post(route('onboarding'), ['name' => 'Acme Corp'])
        ->assertRedirect(route('dashboard'));

    $user->refresh();
    expect($user->current_organization_id)->not->toBeNull();

    $this->assertDatabaseHas('organizations', ['name' => 'Acme Corp']);
    $this->assertDatabaseHas('organization_user', [
        'user_id' => $user->id,
        'role' => 'admin',
    ]);
});

it('generates a unique slug for the organization', function () {
    $user = User::factory()->create(['current_organization_id' => null]);

    $this->actingAs($user)
        ->post(route('onboarding'), ['name' => 'My Company']);

    $organization = Organization::where('name', 'My Company')->first();
    expect($organization->slug)->toStartWith('my-company-');
});

it('requires organization name', function () {
    $user = User::factory()->create(['current_organization_id' => null]);

    $this->actingAs($user)
        ->post(route('onboarding'), [])
        ->assertInvalid(['name']);
});
