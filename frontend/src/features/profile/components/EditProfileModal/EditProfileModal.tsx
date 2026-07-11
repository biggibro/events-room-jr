import clsx from 'clsx'
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { getApiErrorMessage } from '@/api/http'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { useUploadAvatarMutation } from '@/features/uploads/api/useUploads'
import {
  IMAGE_FILE_ACCEPT,
  validateImageFile,
} from '@/features/uploads/utils/imageFileValidation'
import type {
  UpdateCredentialsPayload,
  UpdateProfilePayload,
} from '@/features/profile/types/profile.types'
import styles from './EditProfileModal.module.css'

type Tab = 'profile' | 'security'

export type EditProfileModalProps = {
  open: boolean
  initialValues: {
    email: string
    name: string
    tagline: string
    bio: string
    avatarUrl: string
  }
  profileLoading?: boolean
  profileError?: string
  credentialsLoading?: boolean
  credentialsError?: string
  onSaveProfile: (payload: UpdateProfilePayload) => void
  onSaveCredentials: (payload: UpdateCredentialsPayload) => void
  onCancel: () => void
}

export function EditProfileModal({
  open,
  initialValues,
  profileLoading = false,
  profileError,
  credentialsLoading = false,
  credentialsError,
  onSaveProfile,
  onSaveCredentials,
  onCancel,
}: EditProfileModalProps) {
  const titleId = useId()
  const [tab, setTab] = useState<Tab>('profile')
  const [name, setName] = useState(initialValues.name)
  const [tagline, setTagline] = useState(initialValues.tagline)
  const [bio, setBio] = useState(initialValues.bio)
  const [email, setEmail] = useState(initialValues.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileValidationError, setProfileValidationError] = useState<string>()
  const [credentialsValidationError, setCredentialsValidationError] = useState<string>()
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(initialValues.avatarUrl)
  const [avatarUploadError, setAvatarUploadError] = useState<string>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarUploadMutation = useUploadAvatarMutation()
  const prevCredentialsLoading = useRef(credentialsLoading)

  const initialValuesKey = [
    initialValues.email,
    initialValues.name,
    initialValues.tagline,
    initialValues.bio,
    initialValues.avatarUrl,
  ].join('\0')

  useEffect(() => {
    if (!open) return
    setTab('profile')
    setName(initialValues.name)
    setTagline(initialValues.tagline)
    setBio(initialValues.bio)
    setEmail(initialValues.email)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setProfileValidationError(undefined)
    setCredentialsValidationError(undefined)
    setAvatarPreviewUrl(initialValues.avatarUrl)
    setAvatarUploadError(undefined)
    avatarUploadMutation.reset()
  }, [open, initialValuesKey, initialValues])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onCancel])

  useEffect(() => {
    if (prevCredentialsLoading.current && !credentialsLoading && !credentialsError) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    prevCredentialsLoading.current = credentialsLoading
  }, [credentialsLoading, credentialsError])

  if (!open) return null

  const profileDirty =
    name !== initialValues.name ||
    tagline !== initialValues.tagline ||
    bio !== initialValues.bio

  const emailChanged = email.trim().toLowerCase() !== initialValues.email.toLowerCase()
  const passwordChanged = newPassword.length > 0 || confirmPassword.length > 0
  const credentialsDirty = emailChanged || passwordChanged

  function handleProfileSubmit(event: FormEvent) {
    event.preventDefault()
    setProfileValidationError(undefined)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setProfileValidationError('Имя не может быть пустым')
      return
    }

    if (!profileDirty) return

    onSaveProfile({
      name: trimmedName,
      tagline: tagline.trim(),
      bio: bio.trim(),
    })
  }

  function handleSecuritySubmit(event: FormEvent) {
    event.preventDefault()
    setCredentialsValidationError(undefined)

    if (!credentialsDirty) return

    if (!currentPassword) {
      setCredentialsValidationError('Введите текущий пароль')
      return
    }

    if (emailChanged && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setCredentialsValidationError('Введите корректный email')
      return
    }

    if (passwordChanged) {
      if (newPassword.length < 6) {
        setCredentialsValidationError('Новый пароль должен быть не короче 6 символов')
        return
      }
      if (newPassword !== confirmPassword) {
        setCredentialsValidationError('Пароли не совпадают')
        return
      }
    }

    const payload: UpdateCredentialsPayload = { currentPassword }

    if (emailChanged) {
      payload.email = email.trim().toLowerCase()
    }

    if (newPassword) {
      payload.newPassword = newPassword
    }

    onSaveCredentials(payload)
  }

  const activeError =
    tab === 'profile'
      ? profileValidationError || profileError || avatarUploadError
      : credentialsValidationError || credentialsError

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setAvatarUploadError(validationError)
      return
    }

    setAvatarUploadError(undefined)
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreviewUrl(previewUrl)
    avatarUploadMutation.mutate(file, {
      onSuccess: (result) => {
        URL.revokeObjectURL(previewUrl)
        setAvatarPreviewUrl(result.url)
      },
      onError: (error) => {
        URL.revokeObjectURL(previewUrl)
        setAvatarPreviewUrl(initialValues.avatarUrl)
        setAvatarUploadError(
          getApiErrorMessage(error, 'Не удалось загрузить фото'),
        )
      },
    })
  }

  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={clsx('glass-card', styles.dialog)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <h2 id={titleId} className={styles.title}>
          Редактирование профиля
        </h2>

        <div className={styles.tabs} role="tablist" aria-label="Разделы редактирования">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'profile'}
            className={clsx(styles.tab, tab === 'profile' && styles.tabActive)}
            onClick={() => setTab('profile')}
          >
            Профиль
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'security'}
            className={clsx(styles.tab, tab === 'security' && styles.tabActive)}
            onClick={() => setTab('security')}
          >
            Безопасность
          </button>
        </div>

        {tab === 'profile' ? (
          <form className={styles.tabPanel} onSubmit={handleProfileSubmit}>
            <div className={styles.avatarField}>
              <div className={styles.avatarPreviewWrap}>
                <img className={styles.avatarPreview} src={avatarPreviewUrl} alt="" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={IMAGE_FILE_ACCEPT}
                className={styles.hiddenFileInput}
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={profileLoading || avatarUploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUploadMutation.isPending ? 'Загрузка…' : 'Изменить фото'}
              </Button>
            </div>
            <Input
              label="Имя"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
            <Input
              label="Слоган"
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
              placeholder="Игрок Jackaroo"
            />
            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-profile-bio">
                О себе
              </label>
              <textarea
                id="edit-profile-bio"
                className={styles.textarea}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
              />
            </div>
            {activeError ? (
              <p className={styles.error} role="alert">
                {activeError}
              </p>
            ) : null}
            <div className={styles.actions}>
              <Button type="button" variant="ghost" size="sm" disabled={profileLoading} onClick={onCancel}>
                Отмена
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={
                  profileLoading || !profileDirty || avatarUploadMutation.isPending
                }
              >
                Сохранить
              </Button>
            </div>
          </form>
        ) : (
          <form className={styles.tabPanel} onSubmit={handleSecuritySubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            <Input
              label="Текущий пароль"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />
            <Input
              label="Новый пароль"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />
            <Input
              label="Подтверждение пароля"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
            {activeError ? (
              <p className={styles.error} role="alert">
                {activeError}
              </p>
            ) : null}
            <div className={styles.actions}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={credentialsLoading}
                onClick={onCancel}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={credentialsLoading || !credentialsDirty}
              >
                Сохранить
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}
