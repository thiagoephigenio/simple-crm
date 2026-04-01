<?php

use App\Models\Organization;
use App\Models\User;

it('redirects to onboarding when authenticated user has no organization', function () {
    $user = User::factory()->create(['current_organization_id' => null]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('onboarding'));
});

it('allows access when user has an organization', function () {
    $org = Organization::factory()->create();
    $user = User::factory()->create(['current_organization_id' => $org->id]);
    $org->users()->attach($user->id, ['role' => 'admin']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});

it('redirects unauthenticated users to login', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

it('redirects to onboarding from team page when no organization', function () {
    $user = User::factory()->create(['current_organization_id' => null]);

    $this->actingAs($user)
        ->get(route('team.index'))
        ->assertRedirect(route('onboarding'));
});
