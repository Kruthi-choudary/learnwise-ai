// Anonymous per-browser identity for the Performance Lab.
// No login — just enough identity (a random id persisted in localStorage) so
// the backend can keep each visitor's performance records separate instead
// of sharing one global dataset across everyone using the app.
const STORAGE_KEY = "learnwise.studentId";

export function getStudentId(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
