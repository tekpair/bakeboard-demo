'use client';

import { useRef, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import type { Employee } from '@/lib/types';
import { prepareProfilePhoto } from '@/lib/workspace-logo';
import { useDemoSession } from './demo-session';
import { Avatar } from './ui';
import { useToast } from './toast-provider';

export function MyProfile() {
  const { employee, saveOwnProfile } = useDemoSession();
  return (
    <main id="main" className="dashboard-main my-profile-page">
      <header className="page-heading">
        <div>
          <h1>My Profile</h1>
          <p>Update your name and profile picture.</p>
        </div>
      </header>
      <ProfileEditor
        key={employee.id}
        employee={employee}
        onSave={saveOwnProfile}
      />
    </main>
  );
}

function ProfileEditor({
  employee,
  onSave,
}: {
  employee: Employee;
  onSave: (profile: {
    firstName: string;
    lastName: string;
    photoDataUrl?: string;
  }) => string | null;
}) {
  const showToast = useToast();
  const [firstName, setFirstName] = useState(
    employee.name.split(/\s+/)[0] ?? '',
  );
  const [lastName, setLastName] = useState(
    employee.name.split(/\s+/).slice(1).join(' '),
  );
  const [photoDataUrl, setPhotoDataUrl] = useState(employee.photoDataUrl);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const uploadVersion = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const name = `${firstName.trim()} ${lastName.trim()}`.trim();
  const dirty =
    name !== employee.name || photoDataUrl !== employee.photoDataUrl;
  const firstInvalid = submitted && !firstName.trim();
  const lastInvalid = submitted && !lastName.trim();

  async function upload(file?: File) {
    if (!file) return;
    const version = ++uploadVersion.current;
    setUploading(true);
    setPhotoError('');
    try {
      const result = await prepareProfilePhoto(file);
      if (version === uploadVersion.current) setPhotoDataUrl(result);
    } catch (error) {
      if (version === uploadVersion.current)
        setPhotoError(
          error instanceof Error ? error.message : 'Unable to load this image.',
        );
    } finally {
      if (version === uploadVersion.current) setUploading(false);
    }
  }

  function cancel() {
    uploadVersion.current++;
    setUploading(false);
    setFirstName(employee.name.split(/\s+/)[0] ?? '');
    setLastName(employee.name.split(/\s+/).slice(1).join(' '));
    setPhotoDataUrl(employee.photoDataUrl);
    setPhotoError('');
    setFormError('');
    setSubmitted(false);
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (uploading) return;
    setSubmitted(true);
    if (!firstName.trim() || !lastName.trim()) {
      setFormError('Enter a first and last name.');
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    const error = onSave({ firstName, lastName, photoDataUrl });
    setFormError(error ?? '');
    showToast(error ? 'error' : 'success', error ?? 'Profile updated.');
  }

  return (
    <form ref={formRef} onSubmit={save} noValidate>
      <section
        className="settings-section"
        aria-labelledby="profile-details-title"
      >
        <header>
          <h2 id="profile-details-title">Profile details</h2>
        </header>
        <div className="my-profile-fields">
          <div className="my-profile-photo-row">
            <Avatar
              employee={{
                ...employee,
                name: name || employee.name,
                initials:
                  `${firstName.trim()[0] ?? ''}${lastName.trim()[0] ?? ''}`.toUpperCase() ||
                  employee.initials,
                photoDataUrl,
              }}
              className="my-profile-photo-preview"
            />
            <div className="my-profile-photo-controls">
              <h3>Profile picture</h3>
              <p>Your initials appear when you do not have a picture.</p>
              <div className="settings-logo-actions">
                <label
                  className={`button button-outline logo-upload ${photoError ? 'logo-upload-invalid' : ''}`}
                >
                  <Upload size={15} aria-hidden="true" />
                  {uploading
                    ? 'Preparing image…'
                    : photoDataUrl
                      ? 'Replace photo'
                      : 'Upload photo'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    aria-label="Profile picture image"
                    aria-invalid={!!photoError}
                    aria-describedby={
                      photoError ? 'profile-photo-error' : undefined
                    }
                    disabled={uploading}
                    onChange={(event) => {
                      void upload(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                </label>
                {photoDataUrl && (
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => {
                      uploadVersion.current++;
                      setUploading(false);
                      setPhotoDataUrl(undefined);
                      setPhotoError('');
                    }}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Remove photo
                  </button>
                )}
              </div>
              <small>PNG, JPEG or WebP · up to 5 MB.</small>
              {photoError && (
                <p
                  id="profile-photo-error"
                  className="field-error"
                  role="alert"
                >
                  {photoError}
                </p>
              )}
            </div>
          </div>
          <div className="my-profile-name-fields">
            <label className="form-field">
              First name
              <input
                autoComplete="given-name"
                maxLength={60}
                required
                value={firstName}
                aria-invalid={firstInvalid}
                className={firstInvalid ? 'field-invalid' : undefined}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setFormError('');
                }}
              />
            </label>
            <label className="form-field">
              Last name
              <input
                autoComplete="family-name"
                maxLength={60}
                required
                value={lastName}
                aria-invalid={lastInvalid}
                className={lastInvalid ? 'field-invalid' : undefined}
                onChange={(event) => {
                  setLastName(event.target.value);
                  setFormError('');
                }}
              />
            </label>
          </div>
        </div>
      </section>
      <div className="my-profile-save-bar">
        <div className="field-error" role={formError ? 'alert' : undefined}>
          {formError}
        </div>
        <div>
          <button
            type="button"
            className="button button-outline"
            onClick={cancel}
            disabled={!dirty || uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={!dirty || uploading}
          >
            Save changes
          </button>
        </div>
      </div>
    </form>
  );
}
