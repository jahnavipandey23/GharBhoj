import { useState } from 'react';
import Icon from '../components/Icon';
import restoImg from '../assets/images/resto.jpg';
import {
  getSlots,
  createBooking,
  getBookingStatus
} from '../api/bookings';

const isoDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const TIMES = [
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM'
];

export default function BookTable() {
  const [date, setDate] = useState(isoDate(new Date()));
  const [time, setTime] = useState('7:30 PM');
  const [guests, setGuests] = useState(2);
  const [slots, setSlots] = useState([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [slotMessage, setSlotMessage] = useState('');

  const [checked, setChecked] = useState(false);
  const [selectedAvailable, setSelectedAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const resetAvailability = () => {
    setChecked(false);
    setSelectedAvailable(false);
    setSlotMessage('');
    setSlots([]);
    setError('');
  };

  const loadSlots = async () => {
    setChecking(true);
    setError('');
    setSlotMessage('');
    setChecked(false);
    setSelectedAvailable(false);

    try {
      const response = await getSlots(date, guests);

      const result = Array.isArray(response)
        ? response
        : response?.slots;

      if (!Array.isArray(result)) {
        throw new Error('Invalid availability response.');
      }

      setSlots(result);
      setChecked(true);

      const selected = result.find(
        (s) => s.time === time
      );

      if (selected?.available) {
        setSelectedAvailable(true);

        setSlotMessage(
          `${time} is available for ${guests} guest${
            guests === 1 ? '' : 's'
          }. You can submit a booking request. Confirmation requires counter payment and staff approval.`
        );
      } else {
        const available = result.filter(
          (s) => s.available
        );

        setSlotMessage(
          available.length
            ? `${time} is full. Please choose one of the available slots below.`
            : 'Sorry, all slots are full for this date. Please choose another date.'
        );
      }
    } catch (e) {
      setError(
        e.message ||
          'Could not check availability. Please try again.'
      );
    } finally {
      setChecking(false);
    }
  };

  const chooseSlot = (slotTime) => {
    const selected = slots.find(
      (s) => s.time === slotTime
    );

    if (!selected?.available) return;

    setTime(slotTime);
    setSelectedAvailable(true);

    setSlotMessage(
      `${slotTime} is available. You can submit a booking request. Confirmation requires counter payment and staff approval.`
    );

    setError('');
  };

  const shiftDay = (n) => {
    const d = new Date(date + 'T12:00');
    d.setDate(d.getDate() + n);

    const nextDate = isoDate(d);

    if (nextDate < isoDate(new Date())) return;

    setDate(nextDate);
    resetAvailability();
  };

  const dateLabel = new Date(
    date + 'T12:00'
  ).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const confirm = async () => {
    if (submitting) return;

    setError('');

    if (!checked || !selectedAvailable) {
      setError(
        'Please check availability and select an available time slot first.'
      );
      return;
    }

    if (
      name.trim().length < 2 ||
      !/^\d{10}$/.test(phone.trim())
    ) {
      setError(
        'Add your name and a 10-digit phone number.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const b = await createBooking({
        name: name.trim(),
        phone: phone.trim(),
        guests,
        date,
        time
      });

      if (!b?.ref) {
        throw new Error(
          'Booking reference missing from server response.'
        );
      }

      setBooked({
        ...b,
        phone: phone.trim(),
        status: b.status || 'pending',
        dateLabel: new Date(
          date + 'T12:00'
        ).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short'
        })
      });
    } catch (e) {
      setError(
        e.message ||
          'Booking failed. Please check availability again.'
      );

      setSelectedAvailable(false);
      setChecked(false);
      setSlotMessage(
        'Availability may have changed. Please check again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const refreshStatus = async () => {
    if (!booked?.ref || refreshing) return;

    setRefreshing(true);
    setError('');

    try {
      const result = await getBookingStatus(
        booked.ref,
        booked.phone || phone
      );

      setBooked((old) => ({
        ...old,
        ...result
      }));
    } catch (e) {
      setError(
        e.message ||
          'Could not refresh booking status.'
      );
    } finally {
      setRefreshing(false);
    }
  };

  if (booked) {
    const status = booked.status || 'pending';

    return (
      <div className="wrap">
        <h2 className="pg">Booking Request</h2>

        <div
          className="card"
          style={{ maxWidth: 440 }}
        >
          <p
            className="note"
            style={{ margin: 0 }}
          >
            Booking reference
          </p>

          <div
            className="big"
            style={{ fontSize: 44 }}
          >
            {booked.ref}
          </div>

          <p>
            <b>{booked.name}</b>
            <br />
            {booked.guests} guests ·{' '}
            {booked.dateLabel} · {booked.time}
          </p>

          <p
            style={{
              fontWeight: 700,
              color:
                status === 'verified'
                  ? '#16803d'
                  : status === 'rejected'
                  ? '#b3261e'
                  : '#9a5b00'
            }}
          >
            Status:{' '}
            {status === 'verified'
              ? 'Verified — Seat Confirmed'
              : status === 'rejected'
              ? 'Rejected'
              : 'Pending Staff Verification'}
          </p>

          <p className="note">
            {status === 'pending'
              ? `Visit the restaurant counter, pay the ₹${
                  booked.depositAmount ?? 100
                } advance and show your booking reference to staff. Your seat is not reserved until staff verifies payment.`
              : status === 'verified'
              ? 'Your counter advance payment has been recorded. Your seat is confirmed.'
              : 'Please contact the restaurant counter.'}
          </p>

          {error && (
            <p className="err" role="alert">
              {error}
            </p>
          )}

          <button
            className="btn"
            onClick={refreshStatus}
            disabled={refreshing}
          >
            {refreshing
              ? 'Checking…'
              : 'Refresh Status'}
          </button>{' '}

          <button
            className="btn o"
            onClick={() => {
              setBooked(null);
              setName('');
              setPhone('');
              resetAvailability();
            }}
          >
            Book another table
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <h2 className="pg">Book a Table</h2>

      <p className="sub">
        Reserve your spot for a comfortable dining
        experience.
      </p>

      <div className="two e">
        <div className="card">
          <div className="fr">
            <div className="ic">
              <Icon name="cal" />
            </div>

            <div>
              <label htmlFor="bd">Date</label>

              <input
                id="bd"
                type="date"
                value={date}
                min={isoDate(new Date())}
                onChange={(e) => {
                  if (e.target.value) {
                    setDate(e.target.value);
                    resetAvailability();
                  }
                }}
              />
            </div>
          </div>

          <div className="fr">
            <div className="ic">
              <Icon name="clock" />
            </div>

            <div>
              <label htmlFor="bt">Time</label>

              <select
                id="bt"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  resetAvailability();
                }}
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="fr">
            <div className="ic">
              <Icon name="users" />
            </div>

            <div>
              <label htmlFor="bg">
                Number of Guests
              </label>

              <select
                id="bg"
                value={guests}
                onChange={(e) => {
                  setGuests(+e.target.value);
                  resetAvailability();
                }}
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map(
                  (n) => (
                    <option key={n} value={n}>
                      {n} guest
                      {n > 1 ? 's' : ''}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <button
            className="btn full"
            onClick={loadSlots}
            disabled={checking}
          >
            {checking
              ? 'Checking…'
              : 'Check Availability →'}
          </button>

          {slotMessage && (
            <p
              role="status"
              style={{
                margin: '12px 0 0',
                color: selectedAvailable
                  ? '#16803d'
                  : '#9a5b00',
                fontWeight: 600
              }}
            >
              {slotMessage}
            </p>
          )}

          {error && !checked && (
            <p className="err" role="alert">
              {error}
            </p>
          )}
        </div>

        <img
          className="resto"
          src={restoImg}
          alt="Restaurant dining area"
        />
      </div>

      {checked &&
        !selectedAvailable &&
        slots.some((s) => s.available) && (
          <div
            className="card"
            style={{ margin: '22px 0 34px' }}
          >
            <div className="sh">
              <div>
                <h3 style={{ fontSize: 22 }}>
                  Available Slots
                </h3>

                <p
                  className="note"
                  style={{ margin: '4px 0 0' }}
                >
                  Your selected time is full.
                  Choose an available time.
                </p>
              </div>

              <div className="dn">
                <button
                  className="btn o sm"
                  aria-label="Previous day"
                  disabled={
                    date <= isoDate(new Date())
                  }
                  onClick={() => shiftDay(-1)}
                >
                  ‹
                </button>

                <span>{dateLabel}</span>

                <button
                  className="btn o sm"
                  aria-label="Next day"
                  onClick={() => shiftDay(1)}
                >
                  ›
                </button>
              </div>
            </div>

            <div className="slots">
              {slots
                .filter((s) => s.available)
                .map((s) => (
                  <button
                    key={s.time}
                    className={`sl ${
                      time === s.time ? 'on' : ''
                    }`}
                    onClick={() =>
                      chooseSlot(s.time)
                    }
                  >
                    {s.time}
                  </button>
                ))}
            </div>
          </div>
        )}

      {checked && selectedAvailable && (
        <div
          className="card"
          style={{ margin: '22px 0 34px' }}
        >
          <h3 style={{ fontSize: 22 }}>
            Request a Table
          </h3>

          <p className="note">
            {dateLabel} · {time} · {guests} guest
            {guests === 1 ? '' : 's'}
          </p>

          <div
            className="two e"
            style={{ marginTop: 20 }}
          >
            <div>
              <label htmlFor="bn">Name</label>

              <input
                id="bn"
                placeholder="Your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>

            <div>
              <label htmlFor="bp">Phone</label>

              <input
                id="bp"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit number"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 10)
                  )
                }
              />
            </div>
          </div>

          <div
            className="err"
            role="alert"
          >
            {error}
          </div>

          <button
            className="btn"
            onClick={confirm}
            disabled={submitting}
          >
            {submitting
              ? 'Submitting…'
              : 'Submit Booking Request →'}
          </button>
        </div>
      )}
    </div>
  );
}
