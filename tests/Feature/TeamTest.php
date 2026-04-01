<?php

use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

// ── helpers ──────────────────────────────────────────────────────────────────

function orgWithAdmin(): array
{
    $org = Organization::factory()->create();
    $admin = User::factory()->create(['current_organization_id' => $org->id]);
    $org->users()->attach($admin->id, ['role' => 'admin']);

    return [$org, $admin];
}

// ── index ─────────────────────────────────────────────────────────────────────

it('shows team members and pending invitations', function () {
    [$org, $admin] = orgWithAdmin();
    $member = User::factory()->create();
    $org->users()->attach($member->id, ['role' => 'salesperson']);
    Invitation::factory()->create(['organization_id' => $org->id]);

    $this->actingAs($admin)
        ->get(route('team.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('team/index')
            ->has('members', 2)
            ->has('pendingInvitations', 1)
        );
});

it('does not include expired or accepted invitations in the pending list', function () {
    [$org, $admin] = orgWithAdmin();
    Invitation::factory()->expired()->create(['organization_id' => $org->id]);
    Invitation::factory()->accepted()->create(['organization_id' => $org->id]);

    $this->actingAs($admin)
        ->get(route('team.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('pendingInvitations', 0));
});

it('marks the current user in the members list', function () {
    [$org, $admin] = orgWithAdmin();

    $this->actingAs($admin)
        ->get(route('team.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('members.0.is_current_user', true)
        );
});

it('requires authentication to view the team', function () {
    $this->get(route('team.index'))->assertRedirect(route('login'));
});

// ── update ────────────────────────────────────────────────────────────────────

it('updates a team member role', function () {
    [$org, $admin] = orgWithAdmin();
    $member = User::factory()->create(['current_organization_id' => $org->id]);
    $org->users()->attach($member->id, ['role' => 'salesperson']);

    $this->actingAs($admin)
        ->patch(route('team.update', $member), ['role' => 'manager'])
        ->assertRedirect();

    expect($org->users()->where('users.id', $member->id)->first()->pivot->role)->toBe('manager');
});

it('rejects an invalid role when updating a member', function () {
    [$org, $admin] = orgWithAdmin();
    $member = User::factory()->create(['current_organization_id' => $org->id]);
    $org->users()->attach($member->id, ['role' => 'salesperson']);

    $this->actingAs($admin)
        ->patch(route('team.update', $member), ['role' => 'superuser'])
        ->assertInvalid(['role']);
});

it('requires authentication to update a member', function () {
    $member = User::factory()->create();

    $this->patch(route('team.update', $member), ['role' => 'manager'])
        ->assertRedirect(route('login'));
});

// ── destroy ───────────────────────────────────────────────────────────────────

it('removes a member from the organization', function () {
    [$org, $admin] = orgWithAdmin();
    $member = User::factory()->create(['current_organization_id' => $org->id]);
    $org->users()->attach($member->id, ['role' => 'salesperson']);

    $this->actingAs($admin)
        ->delete(route('team.destroy', $member))
        ->assertRedirect();

    expect($org->users()->where('users.id', $member->id)->exists())->toBeFalse();
});

it('clears current_organization_id when removing a member whose current org is this one', function () {
    [$org, $admin] = orgWithAdmin();
    $member = User::factory()->create(['current_organization_id' => $org->id]);
    $org->users()->attach($member->id, ['role' => 'salesperson']);

    $this->actingAs($admin)->delete(route('team.destroy', $member));

    expect($member->fresh()->current_organization_id)->toBeNull();
});

it('requires authentication to remove a member', function () {
    $member = User::factory()->create();

    $this->delete(route('team.destroy', $member))
        ->assertRedirect(route('login'));
});

// ── resendInvitation ──────────────────────────────────────────────────────────

it('resends an invitation and extends its expiry', function () {
    Mail::fake();

    [$org, $admin] = orgWithAdmin();
    $invitation = Invitation::factory()->create(['organization_id' => $org->id]);
    $originalExpiry = $invitation->expires_at;

    $this->travel(1)->days();

    $this->actingAs($admin)
        ->post(route('team.invitations.resend', $invitation))
        ->assertRedirect();

    Mail::assertQueued(InvitationMail::class);
    expect($invitation->fresh()->expires_at->isAfter($originalExpiry))->toBeTrue();
});

it('requires authentication to resend an invitation', function () {
    $invitation = Invitation::factory()->create();

    $this->post(route('team.invitations.resend', $invitation))
        ->assertRedirect(route('login'));
});

// ── destroyInvitation ─────────────────────────────────────────────────────────

it('deletes a pending invitation', function () {
    [$org, $admin] = orgWithAdmin();
    $invitation = Invitation::factory()->create(['organization_id' => $org->id]);

    $this->actingAs($admin)
        ->delete(route('team.invitations.destroy', $invitation))
        ->assertRedirect();

    $this->assertDatabaseMissing('invitations', ['id' => $invitation->id]);
});

it('requires authentication to delete an invitation', function () {
    $invitation = Invitation::factory()->create();

    $this->delete(route('team.invitations.destroy', $invitation))
        ->assertRedirect(route('login'));
});
