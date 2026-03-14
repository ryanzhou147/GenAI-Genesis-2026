import os
from datetime import datetime, timedelta
from typing import Optional
from zoneinfo import ZoneInfo
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

CLINIC_TZ = ZoneInfo("America/Toronto")


def _calendar_service(google_token: str, refresh_token: Optional[str] = None):
    creds = Credentials(
        token=google_token,
        refresh_token=refresh_token or None,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ.get("GOOGLE_CLIENT_ID"),
        client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    )
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def get_free_slots(google_token: str, start_date: str, end_date: str, refresh_token: Optional[str] = None) -> list[dict]:
    """
    Return 30-minute free slots Mon–Fri 8am–5pm Toronto time.
    start_date / end_date: ISO date strings like '2026-03-13'.
    """
    service = _calendar_service(google_token, refresh_token)

    # Query freebusy in UTC but spanning the full local days
    time_min = datetime.fromisoformat(start_date).replace(
        hour=0, minute=0, second=0, tzinfo=CLINIC_TZ
    ).isoformat()
    time_max = datetime.fromisoformat(end_date).replace(
        hour=23, minute=59, second=59, tzinfo=CLINIC_TZ
    ).isoformat()

    freebusy = service.freebusy().query(body={
        "timeMin": time_min,
        "timeMax": time_max,
        "items": [{"id": "primary"}],
    }).execute()

    busy_periods = freebusy["calendars"]["primary"]["busy"]
    busy = []
    for p in busy_periods:
        busy.append((
            datetime.fromisoformat(p["start"].replace("Z", "+00:00")),
            datetime.fromisoformat(p["end"].replace("Z", "+00:00")),
        ))

    # Generate 30-min slots 8am–5pm Toronto time
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date)

    slots = []
    current = start_dt
    while current <= end_dt:
        if current.weekday() < 5:  # Mon–Fri
            for hour in range(8, 17):
                for minute in (0, 30):
                    slot_start = datetime(
                        current.year, current.month, current.day,
                        hour, minute, 0, tzinfo=CLINIC_TZ
                    )
                    slot_end = slot_start + timedelta(minutes=30)
                    if not _overlaps_busy(slot_start, slot_end, busy):
                        slots.append({
                            "start": slot_start.isoformat(),
                            "end": slot_end.isoformat(),
                        })
        current += timedelta(days=1)

    return slots


def _overlaps_busy(slot_start, slot_end, busy):
    for b_start, b_end in busy:
        if slot_start < b_end and slot_end > b_start:
            return True
    return False


def create_event(
    google_token: str,
    clinic_name: str,
    clinic_address: str,
    start_datetime: str,
    end_datetime: str,
    refresh_token: Optional[str] = None,
) -> dict:
    """Create a Google Calendar event for the appointment."""
    service = _calendar_service(google_token, refresh_token)

    event = {
        "summary": f"Dental Appointment at {clinic_name}",
        "location": clinic_address,
        "description": "Dental appointment booked via Clinic Locator agent.",
        "start": {"dateTime": start_datetime, "timeZone": "America/Toronto"},
        "end": {"dateTime": end_datetime, "timeZone": "America/Toronto"},
    }

    created = service.events().insert(calendarId="primary", body=event).execute()
    return {
        "event_id": created["id"],
        "html_link": created.get("htmlLink"),
        "summary": created.get("summary"),
        "start": created["start"]["dateTime"],
        "end": created["end"]["dateTime"],
    }


def delete_event(google_token: str, event_id: str) -> None:
    service = _calendar_service(google_token)
    service.events().delete(calendarId="primary", eventId=event_id).execute()
