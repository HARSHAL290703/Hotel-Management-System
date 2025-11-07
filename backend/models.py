from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


class AbstractRoom:
   
    def __init__(self, number: str, price: float) -> None:
        if self.__class__ is AbstractRoom:
            raise TypeError("Cannot instantiate AbstractRoom directly")
        self.number: str = number
        self.price: float = price
        self.is_booked: bool = False
        self.booked_by: Optional[str] = None
        self.status: str = "available"  # available, maintenance, cleaning
        self.amenities: List[str] = []
        self.notes: Optional[str] = None

    def get_description(self) -> str:
        raise NotImplementedError

    @property
    def type(self) -> str:
        return self.__class__.__name__

    def to_dict(self) -> Dict[str, Any]:
        return {
            "number": self.number,
            "price": self.price,
            "isBooked": self.is_booked,
            "bookedBy": self.booked_by,
            "type": self.type,
            "status": self.status,
            "amenities": self.amenities,
            "notes": self.notes,
        }


class SingleRoom(AbstractRoom):
    def get_description(self) -> str:
        return f"Single Room — ₹{self.price}"


class DoubleRoom(AbstractRoom):
    def get_description(self) -> str:
        return f"Double Room — ₹{self.price}"


class SuiteRoom(AbstractRoom):
    def get_description(self) -> str:
        return f"Luxury Suite — ₹{self.price}"


@dataclass
class Booking:
    guest_name: str
    check_in: str  # ISO date string (YYYY-MM-DD)
    check_out: str  # ISO date string (YYYY-MM-DD)
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None
    guest_count: int = 1
    confirmation_number: Optional[str] = None
    notes: Optional[str] = None
    checked_in: bool = False
    checked_out: bool = False
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "guestName": self.guest_name,
            "checkIn": self.check_in,
            "checkOut": self.check_out,
            "guestEmail": self.guest_email,
            "guestPhone": self.guest_phone,
            "guestCount": self.guest_count,
            "confirmationNumber": self.confirmation_number,
            "notes": self.notes,
            "checkedIn": self.checked_in,
            "checkedOut": self.checked_out,
            "checkInTime": self.check_in_time,
            "checkOutTime": self.check_out_time,
        }


class Hotel:
    """Aggregate root coordinating rooms and bookings."""

    def __init__(self) -> None:
        self.rooms: List[AbstractRoom] = []
        # store bookings as mapping roomNo -> Booking
        self._bookings: Dict[str, Booking] = {}

    # -------- Room management --------
    def add_room(self, room: AbstractRoom) -> None:
        if any(r.number == room.number for r in self.rooms):
            raise ValueError("Room already exists")
        self.rooms.append(room)

    def get_room(self, room_no: str) -> Optional[AbstractRoom]:
        return next((r for r in self.rooms if r.number == room_no), None)

    def get_available_rooms(self) -> List[AbstractRoom]:
        return [r for r in self.rooms if not r.is_booked and r.status == "available"]

    def get_booked_rooms(self) -> List[AbstractRoom]:
        return [r for r in self.rooms if r.is_booked]

    # -------- Booking management --------
    def book_room(self, room_no: str, booking: Booking) -> None:
        room = self.get_room(room_no)
        if room is None:
            raise LookupError("Room not found")
        if room.is_booked:
            raise ValueError("Room already booked")
        if room.status != "available":
            raise ValueError(f"Room is not available for booking (status: {room.status})")
        room.is_booked = True
        room.booked_by = booking.guest_name
        self._bookings[room_no] = booking

    def unbook_room(self, room_no: str) -> None:
        room = self.get_room(room_no)
        if room is None:
            raise LookupError("Room not found")
        room.is_booked = False
        room.booked_by = None
        if room_no in self._bookings:
            del self._bookings[room_no]

    # -------- Serialization helpers --------
    def to_dict(self) -> Dict[str, Any]:
        return {
            "rooms": [r.to_dict() for r in self.rooms],
            "bookings": {
                k: v.to_dict() for k, v in self._bookings.items()
            },
        }

    @staticmethod
    def room_from_dict(data: Dict[str, Any]) -> AbstractRoom:
        room_type = data.get("type") or data.get("constructorName") or "SuiteRoom"
        number = str(data["number"])  # normalize to string for consistency
        price = float(data["price"])
        cls = {
            "SingleRoom": SingleRoom,
            "DoubleRoom": DoubleRoom,
            "SuiteRoom": SuiteRoom,
        }.get(room_type, SuiteRoom)
        room = cls(number, price)
        room.is_booked = bool(data.get("isBooked", False))
        room.booked_by = data.get("bookedBy")
        room.status = data.get("status", "available")
        room.amenities = data.get("amenities", [])
        room.notes = data.get("notes")
        return room

    @staticmethod
    def booking_from_dict(data: Dict[str, Any]) -> Booking:
        return Booking(
            guest_name=data["guestName"],
            check_in=data["checkIn"],
            check_out=data["checkOut"],
            guest_email=data.get("guestEmail"),
            guest_phone=data.get("guestPhone"),
            guest_count=data.get("guestCount", 1),
            confirmation_number=data.get("confirmationNumber"),
            notes=data.get("notes"),
            checked_in=data.get("checkedIn", False),
            checked_out=data.get("checkedOut", False),
            check_in_time=data.get("checkInTime"),
            check_out_time=data.get("checkOutTime"),
        )


