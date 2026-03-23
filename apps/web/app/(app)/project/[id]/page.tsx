"use client";

import { useParams } from "next/navigation";

export default function ProjectPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project {id}</h1>
      <p className="text-gray-500 mt-2">Schema editor and ER diagram will go here.</p>
    </div>
  );
}
