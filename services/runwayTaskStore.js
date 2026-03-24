const DEFAULT_TTL_MS = Number(process.env.RUNWAY_TASK_TTL_MS || 1000 * 60 * 60 * 6); // 6 hours
const DEFAULT_CLEANUP_MS = Number(process.env.RUNWAY_TASK_CLEANUP_MS || 1000 * 60 * 10); // 10 minutes

class RunwayTaskStore {
  constructor() {
    this.tasks = new Map();
    this.cleanupTimer = setInterval(() => this.cleanupExpired(), DEFAULT_CLEANUP_MS);
    this.cleanupTimer.unref?.();
  }

  set(uuid, payload) {
    const now = Date.now();
    this.tasks.set(uuid, {
      ...payload,
      createdAt: payload.createdAt || now,
      updatedAt: now,
      expiresAt: now + DEFAULT_TTL_MS,
    });
    return this.tasks.get(uuid);
  }

  get(uuid) {
    const item = this.tasks.get(uuid);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.tasks.delete(uuid);
      return null;
    }
    return item;
  }

  update(uuid, patch) {
    const current = this.get(uuid);
    if (!current) return null;
    return this.set(uuid, { ...current, ...patch, createdAt: current.createdAt });
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [key, value] of this.tasks.entries()) {
      if (now > value.expiresAt) this.tasks.delete(key);
    }
  }
}

module.exports = new RunwayTaskStore();
