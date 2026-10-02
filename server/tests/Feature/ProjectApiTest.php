<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'client_name'  => 'Acme',
            'project_name' => 'Website Redesign',
            'description'  => 'New marketing site',
            'status'       => 'Planning',
            'priority'     => 'High',
            'start_date'   => '2026-10-05',
            'due_date'     => '2026-12-01',
        ], $overrides);
    }

    // ---- GET /projects ----

    public function test_it_returns_an_empty_list_when_there_are_no_projects(): void
    {
        $this->getJson('/projects')
            ->assertOk()
            ->assertExactJson([]);
    }

    public function test_it_lists_all_projects(): void
    {
        Project::factory()->count(3)->create();

        $this->getJson('/projects')
            ->assertOk()
            ->assertJsonCount(3);
    }

    // ---- GET /projects/{id} ----

    public function test_it_shows_a_single_project(): void
    {
        $project = Project::factory()->create(['project_name' => 'Brand Refresh']);

        $this->getJson("/projects/{$project->id}")
            ->assertOk()
            ->assertJsonPath('id', $project->id)
            ->assertJsonPath('project_name', 'Brand Refresh');
    }

    public function test_it_returns_404_json_for_a_missing_project(): void
    {
        $this->getJson('/projects/999')
            ->assertNotFound()
            ->assertExactJson(['message' => 'Project not found.']);
    }

    // ---- POST /projects ----

    public function test_it_creates_a_project(): void
    {
        $this->postJson('/projects', $this->validPayload())
            ->assertCreated()
            ->assertJsonPath('client_name', 'Acme')
            ->assertJsonPath('start_date', '2026-10-05')
            ->assertJsonPath('due_date', '2026-12-01');

        $this->assertDatabaseHas('projects', [
            'client_name'  => 'Acme',
            'project_name' => 'Website Redesign',
            'status'       => 'Planning',
            'priority'     => 'High',
        ]);
    }

    public function test_description_is_optional(): void
    {
        $this->postJson('/projects', $this->validPayload(['description' => null]))
            ->assertCreated();
    }

    public function test_due_date_may_equal_start_date(): void
    {
        $this->postJson('/projects', $this->validPayload([
            'start_date' => '2026-10-05',
            'due_date'   => '2026-10-05',
        ]))->assertCreated();
    }

    #[DataProvider('requiredFields')]
    public function test_required_fields_are_validated(string $field): void
    {
        $payload = $this->validPayload();
        unset($payload[$field]);

        $this->postJson('/projects', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$field]);

        $this->assertDatabaseCount('projects', 0);
    }

    public static function requiredFields(): array
    {
        return [
            'client name'  => ['client_name'],
            'project name' => ['project_name'],
            'status'       => ['status'],
            'priority'     => ['priority'],
            'start date'   => ['start_date'],
            'due date'     => ['due_date'],
        ];
    }

    public function test_blank_client_name_is_rejected_with_a_clear_message(): void
    {
        $this->postJson('/projects', $this->validPayload(['client_name' => '']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['client_name'])
            ->assertJsonPath('errors.client_name.0', 'Client name is required.');
    }

    public function test_invalid_status_is_rejected(): void
    {
        $this->postJson('/projects', $this->validPayload(['status' => 'Done']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status'])
            ->assertJsonPath(
                'errors.status.0',
                'Status must be one of: Planning, In Progress, On Hold, Completed.'
            );
    }

    public function test_invalid_priority_is_rejected(): void
    {
        $this->postJson('/projects', $this->validPayload(['priority' => 'Urgent']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['priority'])
            ->assertJsonPath('errors.priority.0', 'Priority must be one of: Low, Medium, High.');
    }

    public function test_due_date_cannot_be_earlier_than_start_date(): void
    {
        $this->postJson('/projects', $this->validPayload([
            'start_date' => '2026-12-01',
            'due_date'   => '2026-10-01',
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['due_date'])
            ->assertJsonPath('errors.due_date.0', 'Due date cannot be earlier than the start date.');
    }

    public function test_malformed_dates_are_rejected(): void
    {
        $this->postJson('/projects', $this->validPayload(['start_date' => '05/10/2026']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['start_date']);
    }

    // ---- PUT /projects/{id} ----

    public function test_it_updates_a_project(): void
    {
        $project = Project::factory()->create();

        $this->putJson("/projects/{$project->id}", $this->validPayload([
            'status'   => 'In Progress',
            'priority' => 'Low',
        ]))
            ->assertOk()
            ->assertJsonPath('status', 'In Progress')
            ->assertJsonPath('priority', 'Low');

        $this->assertDatabaseHas('projects', [
            'id'       => $project->id,
            'status'   => 'In Progress',
            'priority' => 'Low',
        ]);
    }

    public function test_update_validates_input(): void
    {
        $project = Project::factory()->create(['status' => 'Planning']);

        $this->putJson("/projects/{$project->id}", $this->validPayload(['status' => 'Done']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);

        $this->assertDatabaseHas('projects', ['id' => $project->id, 'status' => 'Planning']);
    }

    public function test_updating_a_missing_project_returns_404(): void
    {
        $this->putJson('/projects/999', $this->validPayload())
            ->assertNotFound()
            ->assertExactJson(['message' => 'Project not found.']);
    }

    // ---- DELETE /projects/{id} ----

    public function test_it_deletes_a_project(): void
    {
        $project = Project::factory()->create();

        $this->deleteJson("/projects/{$project->id}")->assertNoContent();

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_deleting_a_missing_project_returns_404(): void
    {
        $this->deleteJson('/projects/999')
            ->assertNotFound()
            ->assertExactJson(['message' => 'Project not found.']);
    }
}