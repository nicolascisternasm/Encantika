'use client'

import { useCallback } from 'react'

interface Props {
  onFile?: (file: File) => void
  onFiles?: (files: File[]) => void
  multiselect?: boolean
  disabled?: boolean
}

declare global {
  interface Window {
    gapi: any
    google: any
    _gapiLoaded?: boolean
    _gisLoaded?: boolean
    _pickerInited?: boolean
  }
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? ''
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly'

async function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
}

async function openPicker(
  onFile: ((file: File) => void) | undefined,
  onFiles: ((files: File[]) => void) | undefined,
  multiselect: boolean,
) {
  if (!API_KEY || !CLIENT_ID) {
    alert('Falta configurar NEXT_PUBLIC_GOOGLE_API_KEY y NEXT_PUBLIC_GOOGLE_CLIENT_ID en las variables de entorno.')
    return
  }

  await loadScript('https://apis.google.com/js/api.js')
  await loadScript('https://accounts.google.com/gsi/client')

  await new Promise<void>((resolve) => window.gapi.load('client:picker', resolve))
  await window.gapi.client.init({ apiKey: API_KEY, discoveryDocs: [] })

  const token = await new Promise<string>((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (res: any) => {
        if (res.error) reject(new Error(res.error))
        else resolve(res.access_token)
      },
    })
    client.requestAccessToken({ prompt: '' })
  })

  const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES)
    .setIncludeFolders(true)
    .setMimeTypes('image/jpeg,image/png,image/webp')

  let builder = new window.google.picker.PickerBuilder()
    .addView(view)
    .setOAuthToken(token)
    .setDeveloperKey(API_KEY)
    .setTitle(multiselect ? 'Selecciona las imágenes' : 'Selecciona una imagen')

  if (multiselect) {
    builder = builder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
  }

  window.scrollTo({ top: 0, behavior: 'instant' })

  builder.setCallback(async (data: any) => {
      if (data.action !== window.google.picker.Action.PICKED) return

      const docs = data.docs as { id: string; name: string; mimeType: string }[]

      const files = await Promise.all(
        docs.map(async (doc) => {
          const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (!res.ok) throw new Error(`No se pudo descargar ${doc.name}`)
          const blob = await res.blob()
          return new File([blob], doc.name, { type: doc.mimeType })
        })
      )

      if (multiselect && onFiles) {
        onFiles(files)
      } else if (onFile) {
        onFile(files[0])
      }
    })
    .build()
    .setVisible(true)
}

export default function GoogleDrivePicker({ onFile, onFiles, multiselect = false, disabled }: Props) {
  const handleClick = useCallback(() => {
    if (disabled) return
    openPicker(onFile, onFiles, multiselect).catch((err) => {
      console.error('Google Drive Picker error:', err)
      alert('Error al abrir Google Drive. Verifica que las credenciales estén configuradas.')
    })
  }, [onFile, onFiles, multiselect, disabled])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title="Seleccionar imagen desde Google Drive"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        fontSize: 11,
        color: '#9ca3af',
        border: '1px solid #374151',
        borderRadius: 6,
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'border-color 0.15s, color 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#6366f1'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#a5b4fc'
        }
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#374151'
        ;(e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'
      }}
    >
      <GoogleDriveIcon />
      Google Drive
    </button>
  )
}

function GoogleDriveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M6.28 15l-3.5 6.06L8.5 21l3.5-6.06H6.28z" fill="#4285F4"/>
      <path d="M12 3L8.5 9l3.5 6h7L15.5 9 12 3z" fill="#0F9D58"/>
      <path d="M19.22 21.06L15.72 15H8.28l3.5 6.06h7.44z" fill="#FFBB00"/>
    </svg>
  )
}
