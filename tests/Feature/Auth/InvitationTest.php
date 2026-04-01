<?php

use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

// ── show ────────────────────────────────────────────────────────────────────

it('renders the accept invitation page for a pending invitation', function () {
    $invitation = Invitation::factory()->create();

    $this->get(route('invitations.show', $invitation->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/accept-invitation')
            ->has('invitation')
            ->where('invitation.email', $invitation->email)
        );
});

it('redirects to login if the invitation is expired', function () {
    $invitation = Invitation::factory()->expired()->create();

    $this->get(route('invitations.show', $invitation->token))
        ->assertRedirect(route('login'));
});

it('redirects to login if the invitation is already accepted', function () {
    $invitation = Invitation::factory()->accepted()->create();

    $this->get(route('invitations.show', $invitation->token))
        ->assertRedirect(route('login'));
});

it('returns 404 for unknown invitation token', function () {
    $this->get(route('invitations.show', 'invalid-token'))
        ->assertNotFound();
});

// ── accept ───────────────────────────────────────────────────────────────────

it('accepts a pending invitation, creates a user and redirects to dashboard', function () {
    $invitation = Invitation::factory()->create(['email' => 'invited@example.com', 'role' => 'manager']);

    $this->post(route('invitations.accept', $invitation->token), [
        'name' => 'New Member',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('dashboard'));

    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', ['email' => 'invited@example.com', 'name' => 'New Member']);
    $this->assertDatabaseHas('organization_user', [
        'organization_id' => $invitation->organization_id,
        'role' => 'manager',
    ]);

    expect($invitation->fresh()->accepted_at)->not->toBeNull();
});

it('sets current_organization_id when accepting invitation', function () {
    $invitation = Invitation::factory()->create();

    $this->post(route('invitations.accept', $invitation->token), [
        'name' => 'New Member',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', $invitation->email)->first();
    expect($user->current_organization_id)->toBe($invitation->organization_id);
});

it('rejects acceptance of an expired invitation', function () {
    $invitation = Invitation::factory()->expired()->create();

    $this->post(route('invitations.accept', $invitation->token), [
        'name' => 'New Member',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('login'));

    $this->assertGuest();
});

it('rejects acceptance of an already accepted invitation', function () {
    $invitation = Invitation::factory()->accepted()->create();

    $this->post(route('invitations.accept', $invitation->token), [
        'name' => 'New Member',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('login'));
});

it('validates name is required to accept invitation', function () {
    $invitation = Invitation::factory()->create();

    $this->post(route('invitations.accept', $invitation->token), [
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertInvalid(['name']);
});

it('validates password confirmation to accept invitation', function () {
    $invitation = Invitation::factory()->create();

    $this->post(route('invitations.accept', $invitation->token), [
        'name' => 'New Member',
        'password' => 'password',
        'password_confirmation' => 'wrong',
    ])->assertInvalid(['password']);
});

// ── store (send invitation) ──────────────────────────────────────────────────

it('sends an invitation email to the given address', function () {
    Mail::fake();

    $org = Organization::factory()->create();
    $user = User::factory()->create(['current_organization_id' => $org->id]);
    $org->users()->attach($user->id, ['role' => 'admin']);

    $this->actingAs($user)
        ->post(route('invitations.store'), [
            'email' => 'newmember@example.com',
            'role' => 'manager',
        ])->assertRedirect();

    Mail::assertQueued(InvitationMail::class, fn ($mail) => $mail->invitation->email === 'newmember@example.com');
    $this->assertDatabaseHas('invitations', ['email' => 'newmember@example.com', 'role' => 'manager']);
});

it('re-sends invitation if email already has a pending invite', function () {
    Mail::fake();

    $org = Organization::factory()->create();
    $user = User::factory()->create(['current_organization_id' => $org->id]);
    $org->users()->attach($user->id, ['role' => 'admin']);

    Invitation::factory()->create(['organization_id' => $org->id, 'email' => 'repeat@example.com', 'role' => 'salesperson']);

    $this->actingAs($user)
        ->post(route('invitations.store'), [
            'email' => 'repeat@example.com',
            'role' => 'manager',
        ])->assertRedirect();

    expect(Invitation::where('email', 'repeat@example.com')->count())->toBe(1);
    expect(Invitation::where('email', 'repeat@example.com')->first()->role)->toBe('manager');
});

it('rejects inviting yourself', function () {
    $org = Organization::factory()->create();
    $user = User::factory()->create(['current_organization_id' => $org->id]);
    $org->users()->attach($user->id, ['role' => 'admin']);

    $this->actingAs($user)
        ->post(route('invitations.store'), [
            'email' => $user->email,
            'role' => 'manager',
        ])->assertInvalid(['email']);
});

it('rejects inviting an existing member', function () {
    $org = Organization::factory()->create();
    $admin = User::factory()->create(['current_organization_id' => $org->id]);
    $member = User::factory()->create();
    $org->users()->attach($admin->id, ['role' => 'admin']);
    $org->users()->attach($member->id, ['role' => 'salesperson']);

    $this->actingAs($admin)
        ->post(route('invitations.store'), [
            'email' => $member->email,
            'role' => 'manager',
        ])->assertInvalid(['email']);
});

it('requires a valid role to send invitation', function () {
    $org = Organization::factory()->create();
    $user = User::factory()->create(['current_organization_id' => $org->id]);
    $org->users()->attach($user->id, ['role' => 'admin']);

    $this->actingAs($user)
        ->post(route('invitations.store'), [
            'email' => 'anyone@example.com',
            'role' => 'superuser',
        ])->assertInvalid(['role']);
});

it('requires authentication to send an invitation', function () {
    $this->post(route('invitations.store'), [
        'email' => 'someone@example.com',
        'role' => 'manager',
    ])->assertRedirect(route('login'));
});
