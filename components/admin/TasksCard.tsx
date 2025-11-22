"use client";

interface Task {
  id: string;
  title: string;
  room: string;
  priority?: "vip" | "urgent";
  avatar?: string;
  initials?: string;
}

export function TasksCard() {
  const tasks: Task[] = [
    {
      id: "1",
      title: "Clean up room",
      room: "Room 103",
      initials: "R",
    },
    {
      id: "2",
      title: "Change linen, clean windows",
      room: "Villa 1",
      priority: "vip",
      initials: "V",
    },
    {
      id: "3",
      title: "Clean up room",
      room: "Room 102",
      initials: "R",
    },
  ];

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm flex flex-col">
      <h3 className="text-sm font-medium text-gray-600 mb-3">Urgent & vip tasks</h3>

      <div className="divide-y divide-gray-100">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`flex items-center justify-between py-2 ${index === 0 ? "pt-0" : ""}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
              <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1">
                <span>{task.room}</span>
                {task.priority === "vip" && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-500">
                    vip
                  </span>
                )}
              </p>
            </div>

            <div className="ml-3 h-7 w-7 rounded-full bg-gradient-to-tr from-orange-300 to-pink-300 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-white">
                {task.initials}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-3 text-[11px] font-semibold tracking-wide text-gray-400 hover:text-gray-500 transition-colors">
        SEE ALL TASKS
      </button>
    </div>
  );
}
