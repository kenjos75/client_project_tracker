<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'client_name'  => ['required', 'string', 'max:255'],
            'project_name' => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'status'       => ['required', Rule::in(['Planning', 'In Progress', 'On Hold', 'Completed'])],
            'priority'     => ['required', Rule::in(['Low', 'Medium', 'High'])],
            'start_date'   => ['required', 'date_format:Y-m-d'],
            'due_date'     => ['required', 'date_format:Y-m-d', 'after_or_equal:start_date'],
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'client_name.required'    => 'Client name is required.',
            'project_name.required'   => 'Project name is required.',
            'status.required'         => 'Status is required.',
            'status.in'               => 'Status must be one of: Planning, In Progress, On Hold, Completed.',
            'priority.required'       => 'Priority is required.',
            'priority.in'             => 'Priority must be one of: Low, Medium, High.',
            'start_date.required'     => 'Start date is required.',
            'start_date.date_format'  => 'Start date must be in YYYY-MM-DD format.',
            'due_date.required'       => 'Due date is required.',
            'due_date.date_format'    => 'Due date must be in YYYY-MM-DD format.',
            'due_date.after_or_equal' => 'Due date cannot be earlier than the start date.',
        ];
    }
}

