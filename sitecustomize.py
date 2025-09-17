import logging, os, sys, re, time
from logging.handlers import RotatingFileHandler

LOG_PATH = os.getenv("PGSYNC_LOG_PATH", "/pgsync/pgsync.log")
LEVEL = getattr(logging, os.getenv("PGSYNC_LOG_LEVEL", "INFO").upper(), logging.INFO)

fmt = logging.Formatter(
    "%(asctime)s:%(levelname)s:%(name)s: %(message)s",
    "%Y-%m-%d %H:%M:%S",
)

# Root handlers: file + console (stderr)
file_handler = RotatingFileHandler(LOG_PATH, maxBytes=10_000_000, backupCount=5)
file_handler.setFormatter(fmt)

stream_handler = logging.StreamHandler()  # defaults to *stderr* (keep for docker logs)
stream_handler.setFormatter(fmt)

logging.basicConfig(level=LEVEL, handlers=[file_handler, stream_handler], force=True)
root = logging.getLogger()

# Attach root handlers directly to pgsync loggers (don’t rely on propagate)
for name in ("pgsync", "pgsync.sync", "pgsync.querybuilder", "pgsync.utils"):
    lg = logging.getLogger(name)
    lg.setLevel(LEVEL)
    # attach the same handlers the root uses
    for h in root.handlers:
        lg.addHandler(h)
    lg.propagate = False  # avoid duplicate emission

# Optional: dedup identical back-to-back lines
class DedupFilter(logging.Filter):
    def __init__(self, window=2.0):
        self.window = window
        self._last = None
        self._t = 0.0
    def filter(self, record):
        key = (record.name, record.levelno, record.getMessage())
        now = time.monotonic()
        if self._last == key and (now - self._t) < self.window:
            return False
        self._last, self._t = key, now
        return True

for h in root.handlers:
    h.addFilter(DedupFilter())

# Capture STDOUT into logging so printed JSON blobs appear in the file/console.
# (Do NOT wrap stderr; it’s used by StreamHandler for docker logs.)
class _StdToLogger:
    def __init__(self, logger, level=logging.INFO):
        self.logger = logger
        self.level = level
        self._buf = ""
    def write(self, s):
        if not s:
            return 0
        if not isinstance(s, str):
            try:
                s = s.decode("utf-8", "replace")
            except Exception:
                s = str(s)
        self._buf += s
        while "\n" in self._buf:
            line, self._buf = self._buf.split("\n", 1)
            self.logger.log(self.level, line)
        return len(s)
    def flush(self):
        if self._buf:
            self.logger.log(self.level, self._buf)
            self._buf = ""
    def isatty(self):
        return False

stdout_logger = logging.getLogger("pgsync.stdout")
# Let stdout logger propagate to root handlers
stdout_logger.setLevel(LEVEL)
stdout_logger.propagate = True

# Filter out raw SQL lines & separators from captured stdout, keep pkeys + JSON/dicts
ANSI = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")
SQL_PREFIX = re.compile(
    r'^\s*(SELECT|FROM|WHERE|LEFT|RIGHT|INNER|OUTER|JOIN|LATERAL|GROUP|ORDER|LIMIT|OFFSET|ON|CAST|JSON_|AS\b|AND\b|OR\b|-{5,})',
    re.IGNORECASE
)
class SqlNoiseFilter(logging.Filter):
    def filter(self, record):
        msg = ANSI.sub("", record.getMessage())
        if msg.startswith("pkeys:") or msg.startswith("{") or msg.startswith("["):
            return True
        return not SQL_PREFIX.match(msg)

stdout_logger.addFilter(SqlNoiseFilter())

# Redirect only stdout (leave stderr alone for docker logs)
sys.stdout = _StdToLogger(stdout_logger, level=logging.INFO)
