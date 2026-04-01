<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CreateOrganizationRequest;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        if (auth()->user()->current_organization_id) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/onboarding');
    }

    public function store(CreateOrganizationRequest $request): RedirectResponse
    {
        $organization = Organization::create([
            'name' => $request->validated('name'),
            'slug' => Str::slug($request->validated('name')).'-'.Str::random(6),
        ]);

        $user = $request->user();

        $organization->users()->attach($user->id, ['role' => 'admin']);

        $user->update(['current_organization_id' => $organization->id]);

        return redirect()->route('dashboard');
    }
}
