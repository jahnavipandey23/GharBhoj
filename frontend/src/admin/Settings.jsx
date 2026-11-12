import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../api/settings';

export default function Settings() {
  const [s, setS] = useState({ capacity: 1 });
  useEffect(() => { getSettings().then(setS); }, []);

  const update = (key, value) => setS((prev) => ({ ...prev, [key]: Math.max(1, Number(value) || 1) }));
  const save = () => saveSettings({ capacity: s.capacity }); // saved when the field loses focus

  return (
    <>
      <div className="mh"><h2>Settings</h2></div>
      <div className="card" style={{ maxWidth: 420, marginTop: 16 }}>
        <label htmlFor="s1">Orders the kitchen can cook at once</label>
        <input id="s1" type="number" min="1" value={s.capacity} onChange={(e) => update('capacity', e.target.value)} onBlur={save} />
        <p className="note">Wait time is worked out from each dish's cooking time. This number says how many orders are cooked in parallel.</p>
      </div>
    </>
  );
}