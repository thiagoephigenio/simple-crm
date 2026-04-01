<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\AcceptInvitationRequest;
use App\Http\Requests\Auth\InviteRequest;
use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function store(InviteRequest $request): RedirectResponse
    {
        $organization = $request->user()->currentOrganization;

        $invitation = $organization->invitations()->updateOrCreate(
            ['email' => $request->validated('email')],
            [
                'role' => $request->validated('role'),
                'token' => Str::uuid(),
                'accepted_at' => null,
                'expires_at' => now()->addDays(7),
            ],
        );

        Mail::to($invitation->email)->queue(new InvitationMail($invitation));

        return back();
    }

    public function show(string $token): Response|RedirectResponse
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();

        if (! $invitation->isPending()) {
            return redirect()->route('login')->withErrors(['invitation' => 'This invitation has expired or already been accepted.']);
        }

        return Inertia::render('auth/accept-invitation', [
            'invitation' => [
                'email' => $invitation->email,
                'organization' => $invitation->organization->name,
                'role' => $invitation->role,
                'token' => $invitation->token,
            ],
        ]);
    }

    public function accept(AcceptInvitationRequest $request, string $token): RedirectResponse
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();

        if (! $invitation->isPending()) {
            return redirect()->route('login')->withErrors(['invitation' => 'This invitation has expired or already been accepted.']);
        }

        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $invitation->email,
            'password' => $request->validated('password'),
            'current_organization_id' => $invitation->organization_id,
        ]);

        $invitation->organization->users()->attach($user->id, ['role' => $invitation->role]);

        $invitation->update(['accepted_at' => now()]);

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
