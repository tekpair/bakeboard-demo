'use client';
import { useDemoSession } from './demo-session';
import { Avatar } from './ui';
export function BoardTeam() {
  const { employees } = useDemoSession();
  const active = employees.filter((person) => person.active);
  return (
    <div className="board-team">
      <div className="avatar-stack">
        {active.slice(0, 5).map((person) => (
          <Avatar key={person.id} employee={person} />
        ))}
      </div>
      <span>{active.length} active staff members</span>
    </div>
  );
}
