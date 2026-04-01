<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateTeamMemberRequest;
use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(Request $request): Response
    {
        $organization = $request->user()->currentOrganization;

        $members = $organization->users()
            ->select('users.id', 'users.name', 'users.email')
            ->withPivot('role')
            ->orderByPivot('role')
            ->orderBy('users.name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->pivot->role,
                'is_current_user' => $user->id === $request->user()->id,
            ]);

        $pendingInvitations = $organization->invitations()
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->select('id', 'email', 'role', 'expires_at')
            ->latest()
            ->get();

        return Inertia::render('team/index', [
            'members' => $members,
            'pendingInvitations' => $pendingInvitations,
        ]);
    }

    public function update(UpdateTeamMemberRequest $request, User $user): RedirectResponse
    {
        $organization = $request->user()->currentOrganization;

        $organization->users()->updateExistingPivot($user->id, [
            'role' => $request->validated('role'),
        ]);

        return back();
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $organization = $request->user()->currentOrganization;

        $organization->users()->detach($user->id);

        if ($user->current_organization_id === $organization->id) {
            $user->update(['current_organization_id' => null]);
        }

        return back();
    }

    public function resendInvitation(Request $request, Invitation $invitation): RedirectResponse
    {
        $request->user()->currentOrganization
            ->invitations()
            ->where('id', $invitation->id)
            ->update(['expires_at' => now()->addDays(7)]);

        $invitation->refresh();

        Mail::to($invitation->email)->queue(new InvitationMail($invitation));

        return back();
    }

    public function destroyInvitation(Request $request, Invitation $invitation): RedirectResponse
    {
        $request->user()->currentOrganization
            ->invitations()
            ->where('id', $invitation->id)
            ->delete();

        return back();
    }
}
