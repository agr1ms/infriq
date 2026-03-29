"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Project, ProjectsResponse, CreateProjectResponse } from "@/types";

import { FiPlus, FiFolder, FiArrowRight, FiClock, FiLoader } from "react-icons/fi";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await api.get<ProjectsResponse>("/api/projects");
      setProjects(res.data.projects ?? []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) return;

    setCreating(true);
    try {
      const res = await api.post<CreateProjectResponse>("/api/projects/create", {
        name: projectName,
        description: projectDesc || undefined,
      });
      if (res.data.success && res.data.project) {
        router.push(`/project/${res.data.project.id}`);
      }
    } catch {
      alert("Failed to create project. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setProjectName("");
    setProjectDesc("");
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your database schema projects
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary gap-1.5">
          <FiPlus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-gray-400">
            <FiLoader className="animate-spin h-5 w-5" />
            <span className="text-sm">Loading projects…</span>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="card rounded-xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <FiFolder className="w-7 h-7 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            No projects yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-sm mx-auto">
            Create your first project to start generating database schemas from your product requirements.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn-primary gap-1.5">
            <FiPlus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="card group rounded-xl p-5 flex flex-col hover:shadow-card-hover hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
                  <FiFolder className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1 line-clamp-1">
                {project.name}
              </h3>
              {project.description ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
                  {project.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-600 italic mb-3 flex-1">
                  No description
                </p>
              )}
              {project.createdAt && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <FiClock className="w-3.5 h-3.5" />
                  {formatDate(project.createdAt)}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60" onClick={closeModal} />

          <div className="relative bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Project</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Create a new database schema project
              </p>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label
                    htmlFor="project-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Project name
                  </label>
                  <input
                    id="project-name"
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. E-commerce App"
                    className="input-field"
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    htmlFor="project-desc"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Description
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    id="project-desc"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    placeholder="A brief description of your project…"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !projectName.trim()}
                  className="btn-primary"
                >
                  {creating ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
