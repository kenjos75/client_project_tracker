<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjectRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    // GET /projects
    public function index(): JsonResponse
    {
        return response()->json(Project::latest()->get());
    }

    // GET /projects/{id}
    public function show(Project $project): JsonResponse
    {
        return response()->json($project);
    }

    // POST /projects
    public function store(ProjectRequest $request): JsonResponse
    {
        $project = Project::create($request->validated());

        return response()->json($project, 201);
    }

    // PUT /projects/{id}
    public function update(ProjectRequest $request, Project $project): JsonResponse
    {
        $project->update($request->validated());

        return response()->json($project);
    }

    // DELETE /projects/{id}
    public function destroy(Project $project): JsonResponse
    {
        $project->delete();

        return response()->json(null, 204);
    }
}