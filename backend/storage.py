from __future__ import annotations
import json
from pathlib import Path
from typing import Dict, Any

from models import Hotel, Booking


class JsonHotelRepository:
    """Simple JSON file persistence for the Hotel aggregate.

    This keeps the project dependency-free (no DB) and is adequate for a
    small demo. For production, swap this with a proper database layer.
    """

    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path
        self.file_path.parent.mkdir(parents=True, exist_ok=True)

    def load(self) -> Hotel:
        hotel = Hotel()
        if not self.file_path.exists():
            return hotel

        with self.file_path.open("r", encoding="utf-8") as f:
            data: Dict[str, Any] = json.load(f)

        for r in data.get("rooms", []):
            room = Hotel.room_from_dict(r)
            hotel.rooms.append(room)

        bookings = data.get("bookings", {})
        for room_no, b in bookings.items():
            booking = Hotel.booking_from_dict(b)
            # mirror state into room list
            room = hotel.get_room(room_no)
            if room is not None:
                room.is_booked = True
                room.booked_by = booking.guest_name
            hotel._bookings[room_no] = booking

        return hotel

    def save(self, hotel: Hotel) -> None:
        payload = hotel.to_dict()
        tmp_path = self.file_path.with_suffix(".tmp")
        with tmp_path.open("w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        tmp_path.replace(self.file_path)


