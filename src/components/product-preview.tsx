import {
  CalendarDays,
  Check,
  Clock3,
  ListChecks,
  UsersRound,
} from 'lucide-react';

// Read-only examples for the public site; these never populate a visitor's demo.
export function ProductPreview({
  kind,
}: {
  kind: 'board' | 'calendar' | 'details';
}) {
  return (
    <figure className={`product-preview product-preview-${kind}`}>
      <div className="preview-window">
        <div className="preview-window-bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <p>
            BakeBoard /{' '}
            {kind === 'calendar'
              ? 'Calendar'
              : kind === 'details'
                ? 'Task Details'
                : 'Production Board'}
          </p>
        </div>
        {kind === 'board' && (
          <div className="preview-board">
            <div className="preview-title">
              <strong>Production Board</strong>
              <span>Willow & Rye Bakery</span>
            </div>
            <div className="preview-columns">
              {[
                {
                  stage: 'To Do',
                  name: 'Decorated sugar cookies',
                  category: 'Cookies',
                  quantity: '24 cookies',
                  person: 'Sofia',
                  initials: 'SP',
                  time: '2:00 PM',
                  steps: '0/3 steps',
                },
                {
                  stage: 'In Progress',
                  name: 'Vanilla birthday cake',
                  category: 'Cakes',
                  quantity: '1 cake · 8-inch',
                  person: 'Emma',
                  initials: 'EW',
                  time: '4:00 PM',
                  steps: '2/4 steps',
                },
                {
                  stage: 'Ready',
                  name: 'Lemon cupcakes',
                  category: 'Cupcakes',
                  quantity: '12 cupcakes',
                  person: 'Sofia',
                  initials: 'SP',
                  time: '5:30 PM',
                  steps: '3/3 steps',
                },
              ].map((task, index) => (
                <div className="preview-column" key={task.stage}>
                  <p className="preview-stage">
                    <span
                      className={`preview-status-dot preview-status-${index}`}
                    />
                    {task.stage}
                  </p>
                  <div className="preview-task">
                    <span className="preview-secondary">{task.category}</span>
                    <strong className="preview-task-name">{task.name}</strong>
                    <p>Quantity: {task.quantity}</p>
                    <p className="preview-due">
                      <Clock3 size={13} aria-hidden="true" />
                      {task.time}
                    </p>
                    <div className="preview-task-bottom">
                      <span>
                        <ListChecks size={14} aria-hidden="true" />
                        {task.steps}
                      </span>
                      <span className="preview-avatar" title={task.person}>
                        {task.initials}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {kind === 'calendar' && (
          <div className="preview-calendar">
            <div className="preview-title">
              <strong>
                <CalendarDays size={18} aria-hidden="true" />
                Production Calendar
              </strong>
              <span>Week view</span>
            </div>
            <div className="preview-calendar-grid">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
                <div
                  className={`preview-day ${index === 2 ? 'preview-day-current' : ''}`}
                  key={day}
                >
                  <div className="preview-day-heading">
                    <span>{day}</span>
                    <strong>{16 + index}</strong>
                  </div>
                  {(index === 0 || index === 2 || index === 3) && (
                    <div
                      className={`preview-calendar-event ${index === 3 ? 'preview-event-rose' : ''}`}
                    >
                      <strong>
                        {index === 0
                          ? 'Daily pastry prep'
                          : index === 2
                            ? 'Vanilla cake'
                            : 'Sugar cookies'}
                      </strong>
                      <span>
                        {index === 3 ? 'Pickup / Delivery' : 'Production due'}
                      </span>
                      <span>{index === 0 ? '8:00 AM' : '2:00 PM'}</span>
                    </div>
                  )}
                  {index === 2 && (
                    <div className="preview-calendar-event preview-event-rose">
                      <strong>Vanilla cake</strong>
                      <span>Pickup / Delivery</span>
                      <span>4:00 PM</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {kind === 'details' && (
          <div className="preview-details">
            <div className="preview-title">
              <strong>Vanilla birthday cake</strong>
              <span className="preview-type">Customer Production</span>
            </div>
            <p className="preview-detail-summary">
              Quantity: 1 cake · 8-inch · Vanilla bean
            </p>
            <div className="preview-detail-facts">
              <div>
                <span>Production Due</span>
                <strong>
                  <Clock3 size={14} aria-hidden="true" />
                  Today, 2:00 PM
                </strong>
              </div>
              <div>
                <span>Assigned Staff</span>
                <strong>
                  <UsersRound size={14} aria-hidden="true" />
                  Emma & Sofia
                </strong>
              </div>
            </div>
            <div className="preview-allergy">
              <strong>Allergy Notes / Special Handling</strong>
              <p>
                Contains milk, eggs, and wheat. Keep separate from nut
                decorations.
              </p>
            </div>
            <div className="preview-checklist">
              <strong>
                <ListChecks size={17} aria-hidden="true" />
                Production Checklist
              </strong>
              {[
                'Bake and cool cake layers',
                'Fill and frost',
                'Pipe border and package',
              ].map((step, index) => (
                <div key={step}>
                  <span className={index < 2 ? 'preview-checked' : ''}>
                    {index < 2 && <Check size={12} aria-hidden="true" />}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <figcaption>
        Example{' '}
        {kind === 'board'
          ? 'production board'
          : kind === 'calendar'
            ? 'production schedule'
            : 'task details'}{' '}
        · illustrative sample data
      </figcaption>
    </figure>
  );
}
