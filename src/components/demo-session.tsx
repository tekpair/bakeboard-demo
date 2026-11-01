'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type {
  Employee,
  WorkspaceSettings,
  WorkspacePlan,
  ProductionLibrary,
  LibraryKind,
  Product,
  ProductCategory,
  ChecklistTemplate,
} from '@/lib/types';
import { demoRoles, type DemoRole } from '@/lib/task-work';
import {
  employeeChangeEventName,
  readStoredEmployees,
  initializeDemoSlate,
  writeStoredEmployees,
  permanentlyRemoveEmployee,
  readRemovedStaffIds,
  readStoredWorkspaceSettings,
  writeStoredWorkspaceSettings,
  workspaceSettingsChangeEventName,
  readStoredProductionLibrary,
  libraryChangeEventName,
  saveStoredProduct,
  saveStoredCategory,
  duplicateStoredLibraryItem,
  moveStoredLibraryItem,
  deleteStoredLibraryItem,
  saveStoredChecklistTemplate,
} from '@/lib/task-storage';
import { workspace as sampleWorkspace } from '@/lib/demo-seed';
import {
  defaultWorkspaceSettings,
  validLogoData,
} from '@/lib/workspace-settings';
import { hasWorkspaceAccess, validateEmployeeChange } from '@/lib/permissions';

import { defaultProductionLibrary } from '@/lib/production-library';
import { isWorkspacePlan, planEntitlements } from '@/lib/entitlements';
const defaultLibrary = defaultProductionLibrary(sampleWorkspace.id);
const defaultSettings = defaultWorkspaceSettings(sampleWorkspace);
const storageKey = 'bakeboard:demo:session:v1';
type Session = {
  employeeId: string;
  role: DemoRole;
  planPreview?: WorkspacePlan;
};
const DemoSessionContext = createContext<{
  plan: WorkspacePlan;
  selectPlan: (plan: WorkspacePlan) => void;
  library: ProductionLibrary;
  saveCategory: (
    value: ProductCategory,
  ) => ReturnType<typeof saveStoredCategory>;
  saveProduct: (value: Product) => ReturnType<typeof saveStoredProduct>;
  saveTemplate: (
    value: ChecklistTemplate,
  ) => ReturnType<typeof saveStoredChecklistTemplate>;
  duplicateLibraryItem: (
    kind: LibraryKind,
    id: string,
  ) => ReturnType<typeof duplicateStoredLibraryItem>;
  moveLibraryItem: (
    kind: LibraryKind,
    id: string,
    adjacentId: string,
  ) => ReturnType<typeof moveStoredLibraryItem>;
  deleteLibraryItem: (
    kind: LibraryKind,
    id: string,
    replacementCategoryId?: string,
  ) => ReturnType<typeof deleteStoredLibraryItem>;
  workspaceSettings: WorkspaceSettings;
  saveWorkspaceSettings: (
    settings: WorkspaceSettings,
  ) => ReturnType<typeof writeStoredWorkspaceSettings>;
  employee: Employee;
  employees: Employee[];
  role: DemoRole;
  ready: boolean;
  accessRevoked: boolean;
  selectEmployee: (id: string) => void;
  selectRole: (role: DemoRole) => void;
  saveEmployee: (employee: Employee) => string | null;
  saveOwnProfile: (profile: {
    firstName: string;
    lastName: string;
    photoDataUrl?: string;
  }) => string | null;
  removeEmployee: (employeeId: string) => string | null;
} | null>(null);

export function DemoSessionProvider({
  employees: initialEmployees,
  children,
}: {
  employees: Employee[];
  children: React.ReactNode;
}) {
  const [library, setLibrary] = useState(defaultLibrary);
  const [workspaceSettings, setWorkspaceSettings] = useState(defaultSettings);
  const [employees, setEmployees] = useState(initialEmployees);
  const [teamLoaded, setTeamLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session>({
    employeeId: initialEmployees[0]?.id ?? '',
    role: 'owner',
  });
  useEffect(() => {
    initializeDemoSlate();
    const refresh = () => {
      setLibrary(readStoredProductionLibrary());
      setEmployees(readStoredEmployees());
      setWorkspaceSettings(readStoredWorkspaceSettings());
      setTeamLoaded(true);
    };
    refresh();
    window.addEventListener(libraryChangeEventName(), refresh);
    window.addEventListener(workspaceSettingsChangeEventName(), refresh);
    window.addEventListener(employeeChangeEventName(), refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(libraryChangeEventName(), refresh);
      window.removeEventListener(workspaceSettingsChangeEventName(), refresh);
      window.removeEventListener(employeeChangeEventName(), refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  useEffect(() => {
    if (!teamLoaded) return;
    const refresh = () => {
      try {
        const value = JSON.parse(
          window.localStorage.getItem(storageKey) ?? 'null',
        );
        if (value && Object.hasOwn(demoRoles, value.role)) {
          const restored = {
            employeeId: value.employeeId,
            role: value.role,
            ...(isWorkspacePlan(value.planPreview)
              ? { planPreview: value.planPreview }
              : {}),
          };
          setSession(restored);
        }
      } catch {
        /* Keep the default demo identity when stored settings are unavailable. */
      }
      setReady(true);
    };
    refresh();
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [employees, initialEmployees, teamLoaded]);
  function update(next: Session) {
    setSession(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* Session still works in memory. */
    }
  }
  const accessRevoked =
    ready && !hasWorkspaceAccess(employees, session.employeeId);
  const plan = session.planPreview ?? workspaceSettings.plan ?? 'Starter';
  return (
    <DemoSessionContext.Provider
      value={{
        plan,
        selectPlan: (planPreview) => update({ ...session, planPreview }),
        library,
        saveCategory: (value) => {
          const result = saveStoredCategory(
            session.role,
            session.employeeId,
            value,
          );
          if (result.library) setLibrary(result.library);
          return result;
        },
        saveProduct: (value) => {
          const result = saveStoredProduct(
            session.role,
            session.employeeId,
            value,
          );
          if (result.library) setLibrary(result.library);
          return result;
        },
        saveTemplate: (value) => {
          const result = saveStoredChecklistTemplate(
            session.role,
            session.employeeId,
            value,
          );
          if (result.library) setLibrary(result.library);
          return result;
        },
        duplicateLibraryItem: (kind, id) => {
          const result = duplicateStoredLibraryItem(
            session.role,
            session.employeeId,
            kind,
            id,
          );
          if (result.library) setLibrary(result.library);
          return result;
        },
        moveLibraryItem: (kind, id, adjacentId) => {
          const result = moveStoredLibraryItem(
            session.role,
            session.employeeId,
            kind,
            id,
            adjacentId,
          );
          if (result.library) setLibrary(result.library);
          return result;
        },
        deleteLibraryItem: (kind, id, replacementCategoryId) => {
          const result = deleteStoredLibraryItem(
            session.role,
            session.employeeId,
            kind,
            id,
            replacementCategoryId,
          );
          if (result.library) setLibrary(result.library);
          return result;
        },
        workspaceSettings,
        saveWorkspaceSettings: (next) => {
          const result = writeStoredWorkspaceSettings(
            session.role,
            session.employeeId,
            next,
          );
          if (result.settings) setWorkspaceSettings(result.settings);
          return result;
        },
        employee: employees.find(
          (employee) => employee.id === session.employeeId,
        ) ?? {
          id: session.employeeId,
          name: 'Removed staff member',
          initials: '—',
          color: 'sage',
          role: 'viewer',
          active: false,
        },
        employees,
        role: session.role,
        ready,
        accessRevoked,
        selectEmployee: (employeeId) => {
          if (employees.some((person) => person.id === employeeId))
            update({ ...session, employeeId });
        },
        selectRole: (role) => update({ ...session, role }),
        removeEmployee: (employeeId) => {
          if (accessRevoked) return 'Your workspace access has been removed.';
          const result = permanentlyRemoveEmployee(
            session.role,
            session.employeeId,
            employeeId,
          );
          if (result.error) return result.error;
          setEmployees(result.employees!);
          return null;
        },
        saveEmployee: (next) => {
          if (accessRevoked || readRemovedStaffIds().includes(next.id))
            return 'This staff identity no longer has workspace access.';
          const error = validateEmployeeChange(session.role, employees, next);
          if (error) return error;
          const exists = employees.some((person) => person.id === next.id);
          if (
            !exists &&
            employees.length >= planEntitlements[plan].staffMembers
          )
            return `This plan supports up to ${planEntitlements[plan].staffMembers} staff members, including the Owner. Existing members are kept.`;
          const current = employees.find((person) => person.id === next.id);
          const inviter =
            employees.find((person) => person.id === session.employeeId) ??
            employees[0];
          const saved = {
            ...next,
            invitation: exists
              ? current?.invitation
              : {
                  id: `invite-${crypto.randomUUID()}`,
                  createdAt: new Date().toISOString(),
                  status: 'pending' as const,
                  ...(inviter
                    ? { invitedBy: { id: inviter.id, name: inviter.name } }
                    : {}),
                },
          };
          setEmployees(
            writeStoredEmployees(
              exists
                ? employees.map((person) =>
                    person.id === next.id ? saved : person,
                  )
                : [...employees, saved],
            ),
          );
          return null;
        },
        saveOwnProfile: ({ firstName, lastName, photoDataUrl }) => {
          if (
            accessRevoked ||
            readRemovedStaffIds().includes(session.employeeId)
          )
            return 'Your workspace access has been removed.';
          const first = firstName.trim();
          const last = lastName.trim();
          const name = `${first} ${last}`;
          if (
            !first ||
            !last ||
            first.length > 60 ||
            last.length > 60 ||
            name.length > 120
          )
            return 'Enter a first and last name, up to 60 characters each.';
          if (photoDataUrl && !validLogoData(photoDataUrl))
            return 'Choose a valid PNG, JPEG or WebP profile picture.';
          const current = readStoredEmployees();
          if (!current.some((person) => person.id === session.employeeId))
            return 'Your staff record could not be found.';
          setEmployees(
            writeStoredEmployees(
              current.map((person) =>
                person.id === session.employeeId
                  ? {
                      ...person,
                      name,
                      initials: `${first[0]}${last[0]}`.toUpperCase(),
                      photoDataUrl,
                    }
                  : person,
              ),
            ),
          );
          return null;
        },
      }}
    >
      {children}
    </DemoSessionContext.Provider>
  );
}
export function useDemoSession() {
  const session = useContext(DemoSessionContext);
  if (!session)
    throw new Error('Demo session must be used inside the demo workspace.');
  return session;
}
export function useOptionalDemoSession() {
  return useContext(DemoSessionContext);
}

export function useWorkspacePreferences() {
  return useOptionalDemoSession()?.workspaceSettings ?? defaultSettings;
}

export function useProductionLibraryData() {
  return useOptionalDemoSession()?.library ?? defaultLibrary;
}
export function useWorkspacePlan() {
  const session = useOptionalDemoSession();
  return session?.plan ?? defaultSettings.plan ?? 'Starter';
}
