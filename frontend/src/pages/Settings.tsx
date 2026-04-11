import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { deepScanApi, type DeepScanCredential } from '../api/deepScan'
import { settingsApi, type AllSettings } from '../api/settings'
import { useI18n } from '../i18n'

import CredentialsList from '../components/deepScan/CredentialsList'

export default function Settings() {
  const { t, lang, setLang } = useI18n()
  const [settings, setSettings] = useState<AllSettings | null>(null)
  const [credentials, setCredentials] = useState<DeepScanCredential[]>([])
  const [saving, setSaving] = useState(false)
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [credentialForm, setCredentialForm] = useState({
    name: '',
    transport: 'ssh',
    username: '',
    port: '',
    secret: '',
    notes: '',
    use_sudo: false,
    verify_tls: true,
  })

  useEffect(() => {
    Promise.all([settingsApi.get(), deepScanApi.listCredentials()])
      .then(([loadedSettings, loadedCredentials]) => {
        setSettings(loadedSettings)
        setCredentials(loadedCredentials)
      })
      .catch(() => {
        toast.error(lang === 'de' ? 'Einstellungen konnten nicht geladen werden' : 'Failed to load settings')
      })
  }, [lang])

  if (!settings) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  const current = settings

  async function saveTelegram() {
    setSaving(true)
    try {
      await settingsApi.updateTelegram({
        telegram_bot_token: current.telegram_bot_token,
        telegram_chat_id: current.telegram_chat_id,
        telegram_enabled: current.telegram_enabled,
        notify_telegram_update: current.notify_telegram_update,
      })
      toast.success(lang === 'de' ? 'Telegram-Einstellungen gespeichert' : 'Telegram settings saved')
    } catch {
      toast.error(lang === 'de' ? 'Telegram-Einstellungen konnten nicht gespeichert werden' : 'Failed to save Telegram settings')
    } finally {
      setSaving(false)
    }
  }

  async function saveDhcp() {
    setSaving(true)
    try {
      await settingsApi.updateDhcp(current.dhcp_start, current.dhcp_end)
      toast.success(lang === 'de' ? 'DHCP-Bereich gespeichert' : 'DHCP range saved')
    } catch {
      toast.error(lang === 'de' ? 'DHCP-Bereich konnte nicht gespeichert werden' : 'Failed to save DHCP range')
    } finally {
      setSaving(false)
    }
  }

  async function saveScanRange() {
    setSaving(true)
    try {
      await settingsApi.updateScanRange(current.scan_start, current.scan_end)
      toast.success(lang === 'de' ? 'Scan-Bereich gespeichert' : 'Scan range saved')
    } catch {
      toast.error(lang === 'de' ? 'Scan-Bereich konnte nicht gespeichert werden' : 'Failed to save scan range')
    } finally {
      setSaving(false)
    }
  }

  async function saveSchedule() {
    setSaving(true)
    try {
      await settingsApi.updateScanSchedule(current.scan_interval_minutes)
      toast.success(lang === 'de' ? 'Scan-Intervall gespeichert' : 'Scan interval saved')
    } catch {
      toast.error(lang === 'de' ? 'Scan-Intervall konnte nicht gespeichert werden' : 'Failed to save scan interval')
    } finally {
      setSaving(false)
    }
  }

  async function saveServerUrl() {
    setSaving(true)
    try {
      await settingsApi.updateServerUrl(current.server_url)
      toast.success(lang === 'de' ? 'Server-URL gespeichert' : 'Server URL saved')
    } catch {
      toast.error(lang === 'de' ? 'Server-URL konnte nicht gespeichert werden' : 'Failed to save server URL')
    } finally {
      setSaving(false)
    }
  }

  async function testTelegram() {
    try {
      await settingsApi.testTelegram()
      toast.success(lang === 'de' ? 'Testnachricht gesendet' : 'Test message sent')
    } catch {
      toast.error(lang === 'de' ? 'Telegram-Test fehlgeschlagen' : 'Telegram test failed')
    }
  }

  async function saveDeepScan() {
    setSaving(true)
    try {
      await settingsApi.updateDeepScan(current.deep_scan_enabled, current.deep_scan_default_profile)
      toast.success(lang === 'de' ? 'Deep-Scan-Einstellungen gespeichert' : 'Deep scan settings saved')
    } catch {
      toast.error(lang === 'de' ? 'Deep-Scan-Einstellungen konnten nicht gespeichert werden' : 'Failed to save deep scan settings')
    } finally {
      setSaving(false)
    }
  }

  async function createCredential() {
    if (!credentialForm.name.trim() || !credentialForm.username.trim()) {
      toast.error(lang === 'de' ? 'Name und Benutzer sind erforderlich' : 'Name and username are required')
      return
    }
    setSaving(true)
    try {
      const created = await deepScanApi.createCredential({
        name: credentialForm.name.trim(),
        transport: credentialForm.transport,
        username: credentialForm.username.trim(),
        port: credentialForm.port ? Number(credentialForm.port) : undefined,
        secret: credentialForm.secret || undefined,
        notes: credentialForm.notes || undefined,
        use_sudo: credentialForm.use_sudo,
        verify_tls: credentialForm.verify_tls,
      })
      setCredentials((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setCredentialForm({
        name: '',
        transport: credentialForm.transport,
        username: '',
        port: '',
        secret: '',
        notes: '',
        use_sudo: false,
        verify_tls: true,
      })
      toast.success(lang === 'de' ? 'Deep-Scan-Zugang gespeichert' : 'Deep scan credential saved')
    } catch {
      toast.error(lang === 'de' ? 'Deep-Scan-Zugang konnte nicht gespeichert werden' : 'Failed to save deep scan credential')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCredential(id: number) {
    if (!confirm(lang === 'de' ? 'Diesen Deep-Scan-Zugang löschen?' : 'Delete this deep scan credential?')) return
    setSaving(true)
    try {
      await deepScanApi.deleteCredential(id)
      setCredentials((prev) => prev.filter((item) => item.id !== id))
      toast.success(lang === 'de' ? 'Deep-Scan-Zugang gelöscht' : 'Deep scan credential deleted')
    } catch {
      toast.error(lang === 'de' ? 'Deep-Scan-Zugang konnte nicht gelöscht werden' : 'Failed to delete deep scan credential')
    } finally {
      setSaving(false)
    }
  }

  async function checkForUpdates() {
    setCheckingUpdate(true)
    try {
      const result = await settingsApi.checkUpdate()
      if (result.update_available) {
        toast.success(
          lang === 'de'
            ? `Update verfügbar: v${result.latest_version}`
            : `Update available: v${result.latest_version}`
        )
      } else {
        toast.success(
          lang === 'de'
            ? `Kein neueres Update verfügbar (aktuell: v${result.current_version})`
            : `No newer update available (current: v${result.current_version})`
        )
      }
    } catch {
      toast.error(lang === 'de' ? 'Update-Prüfung fehlgeschlagen' : 'Update check failed')
    } finally {
      setCheckingUpdate(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-text-base">LanLens</h2>
            <p className="text-sm text-text-subtle">
              {lang === 'de' ? 'Allgemeine Instanz- und Update-Einstellungen' : 'General instance and update settings'}
            </p>
          </div>
          <Button onClick={checkForUpdates} loading={checkingUpdate}>
            {lang === 'de' ? 'Jetzt auf Updates prüfen' : 'Check for updates now'}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-text-subtle mb-1">{lang === 'de' ? 'Sprache' : 'Language'}</label>
            <select
              className="input-field"
              value={lang}
              onChange={(e) => setLang(e.target.value as 'de' | 'en')}
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-subtle mb-1">Server URL</label>
            <Input
              value={current.server_url}
              onChange={(e) => setSettings({ ...current, server_url: e.target.value })}
              placeholder="https://lanlens.example.com"
            />
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={saveServerUrl} loading={saving}>{t('save_changes')}</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text-base mb-2">{lang === 'de' ? 'DHCP-Bereich' : 'DHCP range'}</h2>
        <p className="text-sm text-text-subtle mb-4">
          {lang === 'de'
            ? 'Dieser Bereich wird nur für DHCP-Markierung und Einordnung der Geräte genutzt.'
            : 'This range is only used for DHCP tagging and device classification.'}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-text-subtle mb-1">{lang === 'de' ? 'DHCP-Start' : 'DHCP start'}</label>
            <Input value={current.dhcp_start} onChange={(e) => setSettings({ ...current, dhcp_start: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-text-subtle mb-1">{lang === 'de' ? 'DHCP-Ende' : 'DHCP end'}</label>
            <Input value={current.dhcp_end} onChange={(e) => setSettings({ ...current, dhcp_end: e.target.value })} />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={saveDhcp} loading={saving}>{t('save_changes')}</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text-base mb-2">{lang === 'de' ? 'Scan-Bereich' : 'Scan range'}</h2>
        <p className="text-sm text-text-subtle mb-4">
          {lang === 'de'
            ? 'Dieser IPv4-Bereich wird aktiv per ARP gescannt. Das funktioniert direkt nur im lokal erreichbaren Layer-2-Netz.'
            : 'This IPv4 range is actively scanned via ARP. This works directly only on the locally reachable Layer 2 network.'}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-text-subtle mb-1">{lang === 'de' ? 'Scan-Start' : 'Scan start'}</label>
            <Input value={current.scan_start} onChange={(e) => setSettings({ ...current, scan_start: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-text-subtle mb-1">{lang === 'de' ? 'Scan-Ende' : 'Scan end'}</label>
            <Input value={current.scan_end} onChange={(e) => setSettings({ ...current, scan_end: e.target.value })} />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={saveScanRange} loading={saving}>{t('save_changes')}</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text-base mb-4">{lang === 'de' ? 'Scan-Zeitplan' : 'Scan schedule'}</h2>
        <div>
          <label className="block text-sm text-text-subtle mb-1">{lang === 'de' ? 'Intervall in Minuten' : 'Interval in minutes'}</label>
          <Input
            type="number"
            value={String(current.scan_interval_minutes)}
            onChange={(e) => setSettings({ ...current, scan_interval_minutes: Number(e.target.value) || 1 })}
          />
        </div>
        <div className="mt-4">
          <Button onClick={saveSchedule} loading={saving}>{t('save_changes')}</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text-base mb-2">Deep Scan</h2>
        <p className="text-sm text-text-subtle mb-4">
          {lang === 'de'
            ? 'Opt-in für credential-basiertes Inventory. Die gespeicherten Secrets bleiben serverseitig verschlüsselt, und pro Gerät wird nur ein Command-Plan protokolliert.'
            : 'Opt-in credential-based inventory. Stored secrets stay encrypted on the server, and each device keeps an auditable command plan.'}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-text-base">
            <input
              type="checkbox"
              checked={current.deep_scan_enabled}
              onChange={(e) => setSettings({ ...current, deep_scan_enabled: e.target.checked })}
            />
            {lang === 'de' ? 'Deep Scan global aktivieren' : 'Enable deep scan globally'}
          </label>

          <div>
            <label className="block text-sm text-text-subtle mb-1">{lang === 'de' ? 'Standard-Profil' : 'Default profile'}</label>
            <select
              className="input-field"
              value={current.deep_scan_default_profile}
              onChange={(e) => setSettings({ ...current, deep_scan_default_profile: e.target.value })}
            >
              <option value="basic">basic</option>
              <option value="services">services</option>
              <option value="hypervisor">hypervisor</option>
              <option value="audit">audit</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={saveDeepScan} loading={saving}>{t('save_changes')}</Button>
        </div>

        <div className="mt-6 pt-5 border-t border-border space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-text-base mb-1">{lang === 'de' ? 'Gespeicherte Zugänge' : 'Stored credentials'}</h3>
            <p className="text-xs text-text-subtle">
              {lang === 'de'
                ? 'Ein Gerät kann einen dieser Zugänge zugewiesen bekommen. Unterstützt werden aktuell SSH- und WinRM-Profile mit Passwort-Secret.'
                : 'A device can be assigned one of these credentials. SSH and WinRM profiles with password secret are supported for now.'}
            </p>
          </div>

          {credentials.length === 0 ? (
            <p className="text-sm text-text-subtle">{lang === 'de' ? 'Noch keine Deep-Scan-Zugänge gespeichert.' : 'No deep scan credentials stored yet.'}</p>
          ) : (
            <div className="space-y-2">
              {credentials.map((credential) => (
                <div key={credential.id} className="rounded-lg border border-border bg-surface2 px-3 py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-text-base">{credential.name}</p>
                    <p className="text-xs text-text-subtle">
                      {credential.transport.toUpperCase()} · {credential.username}
                      {credential.port ? `:${credential.port}` : ''}
                      {credential.use_sudo ? ' · sudo' : ''}
                    </p>
                    {credential.notes && <p className="text-xs text-text-muted mt-1 whitespace-pre-wrap">{credential.notes}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteCredential(credential.id)}>
                    {lang === 'de' ? 'Löschen' : 'Delete'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-border p-4 space-y-4">
            <h3 className="text-sm font-semibold text-text-base">{lang === 'de' ? 'Neuen Zugang anlegen' : 'Create credential'}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-text-subtle mb-1">Name</label>
                <Input value={credentialForm.name} onChange={(e) => setCredentialForm({ ...credentialForm, name: e.target.value })} placeholder="Linux Inventory" />
              </div>
              <div>
                <label className="block text-sm text-text-subtle mb-1">Transport</label>
                <select className="input-field" value={credentialForm.transport} onChange={(e) => setCredentialForm({ ...credentialForm, transport: e.target.value })}>
                  <option value="ssh">SSH</option>
                  <option value="winrm">WinRM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-subtle mb-1">Username</label>
                <Input value={credentialForm.username} onChange={(e) => setCredentialForm({ ...credentialForm, username: e.target.value })} placeholder={credentialForm.transport === 'ssh' ? 'scanner' : 'DOMAIN\\scanner'} />
              </div>
              <div>
                <label className="block text-sm text-text-subtle mb-1">Port</label>
                <Input value={credentialForm.port} onChange={(e) => setCredentialForm({ ...credentialForm, port: e.target.value })} placeholder={credentialForm.transport === 'ssh' ? '22' : '5985'} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-text-subtle mb-1">Secret</label>
                <Input type="password" value={credentialForm.secret} onChange={(e) => setCredentialForm({ ...credentialForm, secret: e.target.value })} placeholder={lang === 'de' ? 'Passwort oder Shared Secret' : 'Password or shared secret'} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-text-subtle mb-1">Notes</label>
                <Input value={credentialForm.notes} onChange={(e) => setCredentialForm({ ...credentialForm, notes: e.target.value })} placeholder={lang === 'de' ? 'z. B. nur lesender Audit-Account' : 'e.g. read-only audit account'} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-text-base">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={credentialForm.use_sudo} onChange={(e) => setCredentialForm({ ...credentialForm, use_sudo: e.target.checked })} />
                {lang === 'de' ? 'sudo für Linux-Probes einplanen' : 'Plan sudo for Linux probes'}
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={credentialForm.verify_tls} onChange={(e) => setCredentialForm({ ...credentialForm, verify_tls: e.target.checked })} />
                {lang === 'de' ? 'TLS/Transport prüfen' : 'Verify TLS/transport'}
              </label>
            </div>

            <Button onClick={createCredential} loading={saving}>{lang === 'de' ? 'Zugang speichern' : 'Save credential'}</Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text-base mb-4">Telegram</h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm text-text-subtle mb-1">Bot Token</label>
            <Input
              value={current.telegram_bot_token}
              onChange={(e) => setSettings({ ...current, telegram_bot_token: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-text-subtle mb-1">Chat ID</label>
            <Input
              value={current.telegram_chat_id}
              onChange={(e) => setSettings({ ...current, telegram_chat_id: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-base">
            <input
              type="checkbox"
              checked={current.telegram_enabled}
              onChange={(e) => setSettings({ ...current, telegram_enabled: e.target.checked })}
            />
            {lang === 'de' ? 'Telegram-Benachrichtigungen aktivieren' : 'Enable Telegram notifications'}
          </label>
          <label className="flex items-center gap-2 text-sm text-text-base">
            <input
              type="checkbox"
              checked={current.notify_telegram_update}
              onChange={(e) => setSettings({ ...current, notify_telegram_update: e.target.checked })}
            />
            {lang === 'de' ? 'Update-Benachrichtigungen senden' : 'Send update notifications'}
          </label>
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={saveTelegram} loading={saving}>{t('save_changes')}</Button>
          <Button onClick={testTelegram} variant="outline">{lang === 'de' ? 'Telegram testen' : 'Test Telegram'}</Button>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
      <div>
        {/* existing settings form left */}
      </div>
      <div>
        <CredentialsList />
      </div>
    </div>
  </div>
  )
}
