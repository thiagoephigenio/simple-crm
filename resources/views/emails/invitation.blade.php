@component('mail::message')
# You've been invited

You've been invited to join **{{ $organizationName }}** as a **{{ $role }}**.

@component('mail::button', ['url' => $acceptUrl])
Accept Invitation
@endcomponent

This invitation expires in 7 days.

Thanks,
{{ config('app.name') }}
@endcomponent
