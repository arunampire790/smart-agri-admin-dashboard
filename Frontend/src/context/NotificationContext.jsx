/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { recommendationsApi } from '../api/recommendations';
import { useAuth } from './AuthContext';

// Notifications are the advisory engine's live suggestions - there is no
// separate notification table, and inventing one would mean two things to
// keep in step. A recommendation the admin dismissed stops ringing the bell,
// because dismissing it is exactly that instruction.
//
// Read state is the one part with nowhere on the server to live: "I have seen
// this" is per-browser, not per-farm. It is keyed on the recommendation's id
// *and* its updated_at, so when the engine revises advice - the field got
// drier, the score went up - it correctly surfaces as unread again.
const READ_KEY = 'advisoryNotifRead';

// Where clicking a suggestion should land. Not every suggestion is about the
// crop: "no robot assigned" is fixed on the assignment screen, "robot has not
// reported" on the data screen, "battery low" on the robot list. Sending all
// of them to the advisory page would mean reading the advice and then having
// to work out where to go.
//
// Keyed on the engine's own rule_key, so a rule and its destination stay
// written down together rather than being guessed from the wording.
const ROUTE_BY_RULE = {
  'no-robot': '/admin/robot-assignment',
  'no-sensor-data': '/admin/robot-data',
  'stale-sensor-data': '/admin/robot-data',
  'low-battery': '/admin/robots',
};

// Everything else is agronomy advice. Once the admin has accepted it there is
// a task to do, so the board is the useful place; until then the advisory page
// is, because that is where the reasoning and the Accept/Dismiss buttons are.
function routeFor(rec) {
  const fixed = ROUTE_BY_RULE[rec.rule_key];
  if (fixed) {
    return {
      path: fixed,
      // The robot screens filter by text, so name the farm to narrow to it.
      state: { focus: rec.farm_name },
    };
  }
  if (rec.status === 'Accepted') {
    return { path: '/admin/tasks', state: { focus: rec.title } };
  }
  return { path: '/admin/advisory', state: { farmId: rec.farm } };
}

function loadRead() {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveRead(keys) {
  try {
    // Cap it: without this the list grows forever as advice is re-run.
    localStorage.setItem(READ_KEY, JSON.stringify([...keys].slice(-200)));
  } catch {
    // A full or blocked localStorage should not break the header.
  }
}

const readKeyFor = (rec) => `${rec.id}:${rec.updated_at}`;

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [readKeys, setReadKeys] = useState(loadRead);

  const refresh = useCallback(async () => {
    const data = await recommendationsApi.live();
    setRecommendations(data);
    return data;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    recommendationsApi
      .live()
      .then((data) => { if (active) setRecommendations(data); })
      .catch((err) => console.error('Failed to load recommendations:', err));
    return () => { active = false; };
  }, [isAuthenticated]);

  const notifications = useMemo(
    () => recommendations.map((rec) => ({
      id: rec.id,
      title: rec.title || rec.recommendation_type,
      type: rec.recommendation_type,
      priority: rec.priority,
      score: rec.priority_score,
      farm: rec.farm_name,
      farmId: rec.farm,
      at: rec.updated_at || rec.created_at,
      read: readKeys.has(readKeyFor(rec)),
      route: routeFor(rec),
    })),
    [recommendations, readKeys],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback((id) => {
    const rec = recommendations.find((r) => r.id === id);
    if (!rec) return;
    setReadKeys((prev) => {
      const next = new Set(prev).add(readKeyFor(rec));
      saveRead(next);
      return next;
    });
  }, [recommendations]);

  const markAllRead = useCallback(() => {
    setReadKeys((prev) => {
      const next = new Set(prev);
      recommendations.forEach((rec) => next.add(readKeyFor(rec)));
      saveRead(next);
      return next;
    });
  }, [recommendations]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markRead, markAllRead, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
