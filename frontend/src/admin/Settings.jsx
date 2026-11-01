import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../api/settings';

const DEFAULTS = {
  capacity: 1,
  perOrder: 4,
  totalTables: 10,
};

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    getSettings()
      .then((data) => {
        if (mounted) {
          setSettings({ ...DEFAULTS, ...data });
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Could not load settings.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const update = (key, value) => {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setMessage('');
    setError('');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    const values = {
      capacity: Number(settings.capacity),
      perOrder: Number(settings.perOrder),
      totalTables: Number(settings.totalTables),
    };

    for (const [key, value] of Object.entries(values)) {
      if (!Number.isInteger(value) || value < 1 || value > 100) {
        const labels = {
          capacity: 'Kitchen capacity',
          perOrder: 'Average preparation time',
          totalTables: 'Available tables per slot',
        };

        setError(`${labels[key]} must be a whole number from 1 to 100.`);
        return;
      }
    }

    setSaving(true);

    try {
      const saved = await saveSettings(values);
      setSettings({ ...DEFAULTS, ...saved });
      setMessage(
        'Settings saved. New queue estimates and table availability will use these values.'
      );
    } catch (err) {
      setError(err.message || 'Could not save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="mh"><h2>Settings</h2></div>
        <p className="note">Loading restaurant settings…</p>
      </>
    );
  }

  return (
    <>
      <div className="mh">
        <h2>Restaurant Settings</h2>
      </div>

      <p className="sub">
        Control queue estimates and table booking availability.
      </p>

      <form
        className="card"
        onSubmit={handleSave}
        style={{ maxWidth: 560, marginTop: 16 }}
      >
        <h3 style={{ fontSize: 20, marginBottom: 18 }}>
          Kitchen &amp; Booking Configuration
        </h3>

        <label htmlFor="capacity">
          Orders the kitchen can cook at once
        </label>
        <input
          id="capacity"
          type="number"
          min="1"
          max="100"
          step="1"
          value={settings.capacity}
          onChange={(e) => update('capacity', e.target.value)}
          required
        />
        <p className="note" style={{ marginTop: 5 }}>
          Higher capacity reduces the estimated waiting time.
        </p>

        <label htmlFor="perOrder" style={{ display: 'block', marginTop: 18 }}>
          Average minutes per order
        </label>
        <input
          id="perOrder"
          type="number"
          min="1"
          max="100"
          step="1"
          value={settings.perOrder}
          onChange={(e) => update('perOrder', e.target.value)}
          required
        />
        <p className="note" style={{ marginTop: 5 }}>
          Used by the queue system to estimate waiting time.
        </p>

        <label htmlFor="totalTables" style={{ display: 'block', marginTop: 18 }}>
          Available tables per booking time slot
        </label>
        <input
          id="totalTables"
          type="number"
          min="1"
          max="100"
          step="1"
          value={settings.totalTables}
          onChange={(e) => update('totalTables', e.target.value)}
          required
        />
        <p className="note" style={{ marginTop: 5 }}>
          The booking system uses this number to decide whether a time slot is full.
        </p>

        {error && (
          <p role="alert" style={{ color: '#b42318', marginTop: 14 }}>
            {error}
          </p>
        )}

        {message && (
          <p role="status" style={{ color: '#247044', marginTop: 14 }}>
            {message}
          </p>
        )}

        <button
          className="btn"
          type="submit"
          disabled={saving}
          style={{ marginTop: 20 }}
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </>
  );
}
