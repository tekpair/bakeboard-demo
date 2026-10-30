export type HelpGuide = {
  id: string;
  title: string;
  summary: string;
  category: string;
  content: string;
  published: boolean;
  updatedAt: string;
};

export const starterGuides: HelpGuide[] = [
  {
    id: 'guide-getting-started',
    title: 'Getting Started with BakeBoard',
    summary: 'Explore the demo workspace and learn where to begin.',
    category: 'Getting started',
    content:
      "Getting started with BakeBoard is simple! Click the **Try Free Demo** button to explore an interactive sample bakery workspace.\n\nStart on the **Overview** page, where you'll find a snapshot of the day's production, upcoming pickups and arrivals, tasks that need attention, and recent staff activity—all in one convenient place.\n\nFrom there, head to the **Production Board** to explore how tasks are organized into four stages: **To Do**, **In Progress**, **Ready**, and **Completed**. Select any task card to view its details, check production progress, and explore its available actions.\n\nFeel free to experiment! The interactive demo saves your changes directly in your browser, so you can explore BakeBoard at your own pace. Whenever you'd like to start fresh, simply use the **Reset Demo** button in the sidebar to restore the original sample workspace.",
    published: true,
    updatedAt: '2026-10-27T12:00:00.000Z',
  },
  {
    id: 'guide-my-profile',
    title: 'How to Update Your Profile Picture, First Name, and Last Name',
    summary: 'Update your name and photo in Account Settings.',
    category: 'Getting started',
    content: `Your **My Profile** page lets you update your own name and profile picture. Changes appear wherever your staff name or avatar is shown in the demo.

### Open My Profile

Select your **name and role** at the bottom of the sidebar to open the account menu, then choose **Account Settings**. The menu's employee, role, and plan previews are temporary demo controls; they do not change your saved staff role.

### Update your name

Edit **First name** or **Last name**, then select **Save changes**. Select **Cancel** if you want to discard your edits.

### Add or remove a photo

Choose **Upload photo** or **Replace photo**, select a **PNG, JPEG, or WebP** image up to **5 MB**, preview it, and save. To return to your initials, select **Remove photo** and save. Your initials are shown automatically whenever you do not have a profile picture.

Your profile is separate from **Workspace Settings** and does not change the bakery's details or another staff member's information. Your assigned role and permissions cannot be changed here.

**Demo note:** Profile changes are saved in this browser. Clearing browser data or using **Reset Demo** may remove them. Individual staff accounts and sign-ins are planned for a future release.`,
    published: true,
    updatedAt: '2026-10-27T12:00:00.000Z',
  },
  {
    id: 'guide-staff-members',
    title: 'How to Add and Remove Staff Members',
    summary: 'Manage staff membership and review pending invites.',
    category: 'Getting started',
    content: `Workspace **Owners** and **Managers** can manage membership from **Staff Management** under **Management** in the sidebar. Team Leads, Employees, and Viewers cannot access this page.

### Add a staff member

Select **Add Staff Member**, enter their first name, last name, email address, and permitted role, then select **Add member**. Select **Cancel** to leave without saving. Managers cannot assign the Manager or Owner role.

### Review pending invites

New staff members appear in **Pending invites** with their name, email, role, inviter, and creation time. **No invitation email is sent in the interactive demo.** Email verification and individual sign-ins are planned for a future release.

### Remove a staff member

In the **Staff directory**, select the person to open their details, then choose **Remove staff member**. Type their full name as shown to enable **Permanently remove**, or select **Cancel** to keep them. The workspace Owner cannot be removed here.

Removing a staff member revokes their demo workspace membership and deletes their recorded activity entries and task assignments. **Production task cards remain in the workspace**, including cards they created or worked on. This removal cannot be undone.`,
    published: true,
    updatedAt: '2026-10-27T12:00:00.000Z',
  },
  {
    id: 'guide-staff-roles',
    title: 'Understanding Staff Roles and Permissions in BakeBoard',
    summary: 'See what each demo role can view and change.',
    category: 'Getting started',
    content: `BakeBoard has five predefined staff roles. A role determines which workspace pages and actions are available in the interactive demo.

### Viewer — read-only access

**Viewers** can review permitted production pages and task details. They cannot create or update tasks, complete checklists, or manage staff.

### Employee — assigned production work

**Employees** can view the shared schedule and **My Tasks**. They can update statuses and checklist steps only on tasks assigned to them. They cannot manage staff or workspace settings.

### Team Lead — production coordination

**Team Leads** can create, edit, assign, and manage production tasks across the bakery, including statuses and checklists. They cannot manage staff members or roles.

### Manager — production and staff management

**Managers** can manage production tasks, the **Production Library**, and staff below Manager level. They can add Team Leads, Employees, and Viewers, but cannot assign Manager or Owner, change another Manager's role, or manage the Owner. **Workspace Settings** remain Owner-only.

### Owner — workspace management

The **Owner** can manage production, staff, roles, the Production Library, and workspace configuration. Each workspace has exactly **one Owner**. Staff Management cannot assign the Owner role to someone else, change the Owner's role, deactivate the Owner, or remove them.

### Preview roles in the demo

Select your name and role at the bottom of the sidebar, then use **Preview role** to see how navigation and actions differ. This temporary preview does not change anyone's saved role.

**Demo note:** These restrictions are simulated in the browser. Real sign-ins and server-enforced permissions are planned for a future release.`,
    published: true,
    updatedAt: '2026-10-27T12:00:00.000Z',
  },
  {
    id: 'guide-workspace-settings',
    title: 'How to Edit Your Bakery Information and Workspace Settings',
    summary:
      'Update bakery details, scheduling preferences, and workspace options.',
    category: 'Getting started',
    content: `The workspace **Owner** can open **Workspace Settings** under **Management** in the sidebar. Other roles cannot access or change these settings.

### Bakery information and branding

Update the **bakery name**, business email, phone, or optional address. Upload or replace a bakery logo to personalize the workspace; if no logo is saved, BakeBoard displays the bakery's initials.

### Workspace preferences

Choose a **time zone**, **12-hour or 24-hour** time format, **Sunday or Monday** as the start of the calendar week, and a default **Day, Week, or Month** calendar view.

### Production settings

Set the default task priority and deadline warning threshold. The built-in production statuses—**To Do**, **In Progress**, **Ready**, and **Completed**—are shown for reference and cannot be renamed or removed.

### Appearance and reminders

**Appearance & Personalization** offers preset themes with the **Plus** preview. The Free preview can see the available themes but cannot apply them. **Notifications & Reminders** lets Plus previews configure email reminder timing, types, and recipients. **No reminder emails are sent in the interactive demo.**

### Workspace information and saving

**Workspace Information** shows the workspace name and ID, permanent Owner, current plan, and demo status. These details are for reference. Select **Save Changes** to apply edits, or **Cancel** to discard them.

**Demo note:** Settings are saved in this browser. Clearing browser data or using **Reset Demo** may restore the original workspace settings.`,
    published: true,
    updatedAt: '2026-10-30T12:00:00.000Z',
  },
  {
    id: 'guide-time-zone-format',
    title: 'How to Change Your Workspace Time Zone and Time Format',
    summary: 'Set the local time zone and clock format for production work.',
    category: 'Getting started',
    content: `Only the workspace **Owner** can change time preferences. Open **Workspace Settings** under **Management**, then find **Workspace Preferences**.

### Choose a time zone

Open **Time zone** and select the zone for your bakery's location. BakeBoard uses it to display production deadlines, pickup times, and scheduled work in the bakery's local time.

### Choose a time format

Open **Time format** and select **12-hour** for AM/PM times, such as 8:30 AM, or **24-hour** for times such as 08:30.

Select **Save Changes** to apply the preferences across relevant workspace pages, including the **Production Board**, **Calendar**, and **My Tasks**. Select **Cancel** to discard your edits.

**Demo note:** Preferences are saved in this browser. Clearing browser data or using **Reset Demo** may restore the defaults.`,
    published: true,
    updatedAt: '2026-10-30T12:00:00.000Z',
  },
  {
    id: 'guide-production-settings',
    title: 'How to Change Default Production Settings',
    summary:
      'Set the priority for new tasks and when deadline warnings appear.',
    category: 'Getting started',
    content: `Only the workspace **Owner** can change production preferences. Open **Workspace Settings** under **Management**, then find **Production Settings**.

### Default task priority

Choose **Low**, **Normal**, or **High**. This priority is preselected when someone creates a new production task; they can still change it for that task. Changing the default does not rewrite priorities on existing tasks.

### Deadline warning threshold

Choose **15**, **30**, **60**, or **120 minutes**. BakeBoard begins showing approaching-deadline warnings when an unfinished **To Do** or **In Progress** task enters that window. Ready and Completed tasks are not treated as overdue production work.

Select **Save Changes** to apply the settings, or **Cancel** to discard your edits.

**Demo note:** These preferences are saved in this browser. Clearing browser data or using **Reset Demo** may restore the defaults.`,
    published: true,
    updatedAt: '2026-10-30T12:00:00.000Z',
  },
  {
    id: 'guide-workspace-theme',
    title: 'How to Change Your Workspace Theme and Colors',
    summary:
      'Choose a preset theme for your bakery workspace with Plus Preview.',
    category: 'Getting started',
    content: `Workspace themes are a **BakeBoard Plus** feature. Only the workspace **Owner** can change them.

### Open the theme settings

Select your name and role at the bottom of the sidebar. In the demo controls, set **Preview plan** to **Plus**. Then open **Workspace Settings** under **Management** and scroll to **Appearance & Personalization**. In the Free preview, you can see the themes but cannot apply them.

### Choose a preset

Select one of the four themes: **Classic Sage** for BakeBoard's signature green, **Soft Rose** for gentle rose tones, **Warm Neutral** for earthy colors, or **Slate Blue** for a cool muted palette. Theme colors come from these presets; individual colors cannot be edited.

Select **Save Changes** to apply your choice throughout the bakery workspace. Changing the theme does not alter tasks, staff assignments, or other production information.

**Demo note:** Your selection is saved in this browser. Clearing browser data or using **Reset Demo** may restore the original theme.`,
    published: true,
    updatedAt: '2026-10-30T12:00:00.000Z',
  },
  {
    id: 'guide-email-reminders',
    title: 'How to Set Up Email Notifications & Reminders',
    summary: 'Preview the planned Plus email reminder settings.',
    category: 'Getting started',
    content: `**Email task reminders** are a planned **BakeBoard Plus** feature. Only the workspace **Owner** can configure their settings.

### Open Notifications & Reminders

Select your name and role at the bottom of the sidebar and set **Preview plan** to **Plus**. Then open **Workspace Settings** under **Management** and scroll to **Notifications & Reminders**. Other roles cannot access Workspace Settings.

### Preview reminder preferences

Use **Enable Email Task Reminders** to turn the preference on. Choose a lead time for upcoming tasks and deadlines, from **15 minutes** to **1 day**. Select reminder types for **upcoming assigned tasks**, **approaching production deadlines**, or **overdue production tasks**. Choose **assigned employees**, the **workspace Owner**, or both as recipients. Select **Save Changes** to keep your preferences in this browser.

**Demo note:** These controls preview future functionality. BakeBoard does not send reminder emails or automated email notifications in the interactive demo. You can continue tracking deadlines in **Overview**, **Production Board**, **Calendar**, and **My Tasks**.`,
    published: true,
    updatedAt: '2026-10-30T12:00:00.000Z',
  },
  {
    id: 'guide-production-tasks',
    title: 'How to Create, Edit, and Delete Tasks',
    summary:
      'Add new work, update task details, and remove tasks you no longer need.',
    category: 'Production',
    content:
      "Managing production tasks in BakeBoard is incredibly easy! Whether you're adding new work, updating details, or removing tasks you no longer need, everything can be managed directly from your **Production Board**.\n\n### Creating a Task\n\nNavigate to the **Production Board** and click **New task**. A form will appear where you can enter the necessary production details, including the task name, product information, deadlines, assigned staff, and checklist steps. Once you've entered the information, click **Create task** to add it to your Production Board.\n\n### Editing a Task\n\nNeed to make a change? Simply select any task card on your **Production Board** to open its details. From there, click **Edit task** at the bottom of the panel to update its information. When you're finished, select **Save changes** to apply your updates. If you change your mind, click **Cancel** to close the form without saving your edits.\n\n### Deleting a Task\n\nTo remove a task, select its card on the **Production Board** and scroll to the bottom of the task details panel. Click **Delete task**, and your browser will display a confirmation prompt. Select **OK** to permanently delete the task, or **Cancel** to keep it.\n\n**Please note:** Deleting a task is permanent and cannot be undone. Be sure you no longer need the task or its information before confirming deletion.",
    published: true,
    updatedAt: '2026-10-27T12:00:00.000Z',
  },
  {
    id: 'guide-production-calendar',
    title: 'How to Use the Production Calendar',
    summary: 'Navigate your production schedule in Day, Week, and Month views.',
    category: 'Production',
    content: `The **Production Calendar** shows scheduled tasks, deadlines, and pickup times using the same task information as the **Production Board** and **My Tasks**.

### Getting started

Select **Calendar** under **Workspace** in the sidebar. The initial workspace preference opens the calendar in **Month** view. The workspace Owner can change the default to **Day**, **Week**, or **Month** in **Workspace Settings**.

### Navigate your schedule

Switch views at the top of the page. Use **Today** to return to the current date, or the arrows to move by one day, week, or month according to your view. **Filters** narrow the tasks shown; **New task** creates a task from the calendar when your role allows it. The current date has a **Today** indicator.

### Month view

See tasks across the month. Select a date to open its day view. Busy dates show **+X more** when additional tasks do not fit in the calendar cell.

### Week view

See the week's tasks grouped by day. Select a day to view all its tasks. Busy days use **+X more** to keep the week compact.

### Day view

See tasks for one date in time order, with their statuses and production details. Select a task to open its details and make updates if your role permits.

### Workspace preferences

In **Workspace Settings**, the Owner can choose whether weeks begin on **Sunday** or **Monday** and set the default calendar view. These preferences apply across the workspace.

Changes to tasks and deadlines are reflected in the calendar after they are saved.`,
    published: true,
    updatedAt: '2026-10-27T12:00:00.000Z',
  },
  {
    id: 'guide-my-tasks',
    title: 'How to View Your Assigned Tasks as a Staff Member',
    summary:
      'Find your assigned work, review progress, and see what needs attention.',
    category: 'Production',
    content: `**My Tasks** gives staff a focused view of the production work assigned to them. Open it under **Staff View** in the sidebar.

### Your workload at a glance

The summary cards show **Assigned Tasks** (open work), **In Progress**, and **Completed Today**. An **Overdue** count appears near the task filters when assigned production work is past its deadline.

### Choose a view

**Today** shows work scheduled for today, including unfinished overdue tasks from earlier dates. **All Active** shows all open assigned work, including upcoming and Ready tasks. **Completed** lets you review finished tasks.

### Follow your work

**Needs My Attention** contains To Do and In Progress tasks, with urgent work prioritized. **Ready / Awaiting Collection** separates tasks whose production is finished; a Ready task without a customer pickup may simply be waiting for its next step. **Completed** keeps finished tasks in a compact list.

Select a task to review instructions, checklist steps, deadlines, and assignments. Depending on your role and whether the task is assigned to you, you may be able to update its status or checklist. Saved changes also appear on the **Production Board** and **Calendar**.`,
    published: true,
    updatedAt: '2026-10-27T12:00:00.000Z',
  },
  {
    id: 'guide-second-production-board',
    title: 'How to Create a Second Production Board',
    summary:
      'A planned BakeBoard Plus feature for separate production workflows.',
    category: 'Production',
    content: `**Coming Soon — BakeBoard Plus Feature**

Creating and managing a second **Production Board** is a planned feature exclusive to **BakeBoard Plus**.

Separate boards will help bakeries organize different areas of production within one workspace. For example, one board could hold custom cakes while another tracks everyday bakery production.

**Please note:** Additional Production Boards are not available in the interactive demo yet. This feature is planned for a future BakeBoard release.`,
    published: true,
    updatedAt: '2026-10-27T12:00:00.000Z',
  },
  {
    id: 'guide-products',
    title: 'Create, Edit, and Delete Products',
    summary: 'Keep the products you make organized in your library.',
    category: 'Production Library',
    content: `Workspace **Owners** and **Managers** can manage products in the **Production Library**.

### Create

Open **Products** and select **Add Product**. Enter a name, choose a category, and optionally add a description. Set its status, then save.

### Edit

Select a product or its **Edit** icon. Update its details and save, or select **Cancel** to leave it unchanged.

### Delete or deactivate

Select the trash icon or open the product and choose **Delete product**. Confirm to permanently remove it. To stop using it while keeping it in your library, set it to **Inactive** instead.`,
    published: true,
    updatedAt: '2026-10-27T12:00:00.000Z',
  },
  {
    id: 'guide-categories',
    title: 'Create, Edit, and Delete Categories',
    summary: 'Group products and keep your library easy to browse.',
    category: 'Production Library',
    content: `Categories organize the products in your **Production Library**. Workspace **Owners** and **Managers** can manage them.

### Create

Open **Categories** and select **Add Category**. Enter a name, optionally add a description, choose its status, and save.

### Edit

Select a category or its **Edit** icon. Update its name, description, or status, then save. Select **Cancel** to discard your edits.

### Delete or deactivate

Select the trash icon or open the category and choose **Delete category**. If it contains products, choose another category for them before confirming. Deletion is permanent; set the category to **Inactive** if you may need it again.`,
    published: true,
    updatedAt: '2026-10-27T12:00:00.000Z',
  },
  {
    id: 'guide-checklist-templates',
    title: 'Create, Edit, and Delete Checklist Templates',
    summary: 'Reuse production steps with BakeBoard Plus.',
    category: 'Production Library',
    content: `Reusable checklist templates are a **BakeBoard Plus** feature. In the demo, set **Plan preview** to **Plus**. Workspace **Owners** and **Managers** can manage templates.

### Create

In the **Production Library**, open **Checklist Templates** and select **Create Template**. Add a name and checklist steps. You can also choose a category, add a description, and set its status. Save when finished.

### Edit

Select a template or its **Edit** icon. Update its details or steps, then save. Select **Cancel** to discard your edits.

### Delete or deactivate

Select the trash icon or open the template and choose **Delete checklist template**. Confirm to permanently remove it. Set it to **Inactive** if you want to keep it for later.`,
    published: true,
    updatedAt: '2026-10-27T12:00:00.000Z',
  },
];
