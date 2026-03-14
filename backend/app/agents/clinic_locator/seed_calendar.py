"""
Seed the dentist's Google Calendar with fake events so free-slot detection works realistically.
Run once: python seed_calendar.py
It will open a browser to authenticate as the dentist Google account.

Requires in backend/.env:
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
"""
import datetime
import os
import random
from dotenv import load_dotenv
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

CLIENT_CONFIG = {
    "installed": {
        "client_id": os.environ["GOOGLE_CLIENT_ID"],
        "client_secret": os.environ["GOOGLE_CLIENT_SECRET"],
        "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
    }
}

FAKE_EVENTS = [
    {"summary": "Patient: John Smith - Cleaning", "duration": 60},
    {"summary": "Patient: Sarah Lee - Root Canal", "duration": 90},
    {"summary": "Patient: Mike Johnson - Checkup", "duration": 30},
    {"summary": "Patient: Emily Chen - Braces Adjustment", "duration": 45},
    {"summary": "Patient: David Brown - Filling", "duration": 60},
    {"summary": "Patient: Anna White - Wisdom Tooth Consult", "duration": 30},
    {"summary": "Patient: Tom Garcia - Crown Fitting", "duration": 90},
    {"summary": "Patient: Lisa Park - X-Ray & Exam", "duration": 45},
    {"summary": "Staff Meeting", "duration": 60},
    {"summary": "Lunch Break", "duration": 60},
    {"summary": "Dental Suppliers Call", "duration": 30},
    {"summary": "Insurance Claims Review", "duration": 45},
    {"summary": "Continuing Education Webinar", "duration": 120},
    {"summary": "Quarterly Planning Meeting", "duration": 90},
    {"summary": "Equipment Maintenance Window", "duration": 60},
]


def seed_events():
    flow = InstalledAppFlow.from_client_config(CLIENT_CONFIG, SCOPES)
    creds = flow.run_local_server(port=8080)
    service = build("calendar", "v3", credentials=creds, cache_discovery=False)

    today = datetime.date.today()
    created = 0

    for day_offset in range(14):
        day = today + datetime.timedelta(days=day_offset)
        if day.weekday() >= 5:
            continue

        day_events = random.sample(FAKE_EVENTS, k=random.randint(4, 7))
        hour = 8

        for ev in day_events:
            if hour >= 17:
                break
            duration = ev["duration"]
            start = datetime.datetime(day.year, day.month, day.day, hour, 0, 0)
            end = start + datetime.timedelta(minutes=duration)

            service.events().insert(
                calendarId="primary",
                body={
                    "summary": ev["summary"],
                    "start": {"dateTime": start.isoformat(), "timeZone": "America/Toronto"},
                    "end":   {"dateTime": end.isoformat(),   "timeZone": "America/Toronto"},
                },
            ).execute()

            created += 1
            hour += duration // 60 + (1 if duration % 60 else 0)

    print(f"Created {created} events over the next 2 weeks.")


if __name__ == "__main__":
    seed_events()
