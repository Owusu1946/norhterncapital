"use client";

interface Activity {
  id: string;
  room: string;
  guest: string;
  action: string;
  time: string;
  avatar?: string;
}

export function ActivityLog() {
  const activities: Activity[] = [
    {
      id: "1",
      room: "Room 103",
      guest: "Maria Peterson",
      action: "Guest entered room",
      time: "3 min"
    },
    {
      id: "2",
      room: "Room 103",
      guest: "",
      action: "Housekeeping exited room",
      time: "15 min"
    },
    {
      id: "3",
      room: "Room 103",
      guest: "",
      action: "Housekeeping entered room",
      time: "14 min"
    },
    {
      id: "4",
      room: "Room 203",
      guest: "",
      action: "Guests checked out",
      time: "35 min"
    },
    {
      id: "5",
      room: "Room 203",
      guest: "",
      action: "Room key checked out",
      time: "54 min"
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-4">Activity Log</h3>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div>
              <p className="text-xs font-medium text-gray-900">{activity.room}</p>
              {activity.guest && (
                <p className="text-xs text-red-500 font-medium">
                  Guest: {activity.guest}
                </p>
              )}
              <p className="text-xs text-gray-600">{activity.action}</p>
            </div>
            <span className="text-[10px] text-gray-400 ml-auto whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
