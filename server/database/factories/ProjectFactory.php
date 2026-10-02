<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('now', '+1 month');
        $due = fake()->dateTimeBetween($start, '+6 months');

        return [
            'client_name'  => fake()->company(),
            'project_name' => fake()->catchPhrase(),
            'description'  => fake()->sentence(),
            'status'       => fake()->randomElement(['Planning', 'In Progress', 'On Hold', 'Completed']),
            'priority'     => fake()->randomElement(['Low', 'Medium', 'High']),
            'start_date'   => $start->format('Y-m-d'),
            'due_date'     => $due->format('Y-m-d'),
        ];
    }
}