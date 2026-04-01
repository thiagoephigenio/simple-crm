<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class InviteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'role' => ['required', Rule::in(['admin', 'manager', 'salesperson'])],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $email = $this->input('email');

                if ($email === $this->user()->email) {
                    $validator->errors()->add('email', 'You cannot invite yourself.');

                    return;
                }

                $alreadyMember = $this->user()
                    ->currentOrganization
                    ->users()
                    ->where('users.email', $email)
                    ->exists();

                if ($alreadyMember) {
                    $validator->errors()->add('email', 'This person is already a member of your organization.');
                }
            },
        ];
    }
}
