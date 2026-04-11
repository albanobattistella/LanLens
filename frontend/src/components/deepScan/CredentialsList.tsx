import { useEffect, useState } from 'react'
import { deepScanApi, DeepScanCredential } from '../../api/deepScan'
import Button from '../ui/Button'

export default function CredentialsList() {
  const [items, setItems] = useState<DeepScanCredential[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    deepScanApi.listCredentials().then((d) => setItems(d)).catch(() => setItems([])).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Deep Scan Credentials</h3>
        <Button size="sm">Create</Button>
      </div>
      {loading ? <p>Loading…</p> : (
        <div className="space-y-2">
          {items.map((c) => (
            <div key={c.id} className="p-2 border rounded bg-surface2 text-sm flex justify-between items-center">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-text-subtle text-xs">{c.transport} · {c.username}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Edit</Button>
                <Button variant="danger" size="sm">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
