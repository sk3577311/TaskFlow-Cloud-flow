# main.py
from threading import Thread
from .retry_scheduler import retry_scheduler_loop

Thread(target=retry_scheduler_loop, daemon=True).start()
