from __future__ import annotations
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

from flask import Flask, jsonify, request
from flask_cors import CORS

from models import SingleRoom, DoubleRoom, SuiteRoom, Booking
from storage import JsonHotelRepository


def create_app(data_path: Path | None = None) -> Flask:
    app = Flask(__name__)
    CORS(app)

    repo = JsonHotelRepository(
        (data_path or Path(__file__).parent / "data.json").resolve()
    )
    hotel = repo.load()

    # ---------- Helpers ----------
    def room_to_public(room) -> Dict[str, Any]:
        result = {
            **room.to_dict(),
            "description": room.get_description(),
        }
        # Include all booking details if room is booked
        if room.is_booked and room.number in hotel._bookings:
            booking = hotel._bookings[room.number]
            result.update(booking.to_dict())
        return result

    def persist():
        repo.save(hotel)

    # ---------- Routes ----------
    @app.get("/rooms")
    def list_rooms():
        status = request.args.get("status")
        rooms = (
            hotel.get_available_rooms()
            if status == "available"
            else hotel.get_booked_rooms()
            if status == "booked"
            else hotel.rooms
        )
        return jsonify([room_to_public(r) for r in rooms])

    @app.post("/rooms")
    def add_room():
        data = request.get_json(force=True)
        number = str(data.get("number", "")).strip()
        price = data.get("price")
        rtype = (data.get("type") or data.get("roomType") or "").strip()
        if not number or price is None or not rtype:
            return jsonify({"error": "number, type and price are required"}), 400

        cls_map = {
            "SingleRoom": SingleRoom,
            "DoubleRoom": DoubleRoom,
            "SuiteRoom": SuiteRoom,
        }
        cls = cls_map.get(rtype)
        if cls is None:
            return jsonify({"error": "Invalid room type"}), 400

        try:
            room = cls(number, float(price))
            hotel.add_room(room)
            persist()
            return jsonify(room_to_public(room)), 201
        except ValueError as e:
            return jsonify({"error": str(e)}), 409

    @app.post("/rooms/<room_no>/book")
    def book_room(room_no: str):
        data = request.get_json(force=True)
        guest = (data.get("guestName") or "").strip()
        check_in = data.get("checkIn")
        check_out = data.get("checkOut")
        if not guest or not check_in or not check_out:
            return jsonify({"error": "guestName, checkIn, checkOut required"}), 400
        
        # Generate confirmation number
        import random
        import string
        confirmation = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        try:
            booking = Booking(
                guest_name=guest,
                check_in=check_in,
                check_out=check_out,
                guest_email=data.get("guestEmail"),
                guest_phone=data.get("guestPhone"),
                guest_count=data.get("guestCount", 1),
                confirmation_number=confirmation,
                notes=data.get("notes")
            )
            hotel.book_room(str(room_no), booking)
            persist()
            return jsonify({"ok": True, "confirmationNumber": confirmation}), 200
        except (LookupError, ValueError) as e:
            return jsonify({"error": str(e)}), 400

    @app.post("/rooms/<room_no>/unbook")
    def unbook_room(room_no: str):
        try:
            hotel.unbook_room(str(room_no))
            persist()
            return jsonify({"ok": True}), 200
        except LookupError as e:
            return jsonify({"error": str(e)}), 404

    @app.put("/rooms/<room_no>")
    def update_room(room_no: str):
        data = request.get_json(force=True)
        price = data.get("price")
        rtype = data.get("type")
        
        room = hotel.get_room(str(room_no))
        if room is None:
            return jsonify({"error": "Room not found"}), 404
        
        if room.is_booked:
            return jsonify({"error": "Cannot update booked room"}), 400
        
        if price is not None:
            room.price = float(price)
        
        if rtype:
            # Create new room instance with updated type
            cls_map = {
                "SingleRoom": SingleRoom,
                "DoubleRoom": DoubleRoom,
                "SuiteRoom": SuiteRoom,
            }
            cls = cls_map.get(rtype)
            if cls is None:
                return jsonify({"error": "Invalid room type"}), 400
            
            # Replace room in list
            index = hotel.rooms.index(room)
            new_room = cls(room.number, room.price)
            hotel.rooms[index] = new_room
        
        persist()
        return jsonify(room_to_public(hotel.get_room(str(room_no)))), 200

    @app.delete("/rooms/<room_no>")
    def delete_room(room_no: str):
        room = hotel.get_room(str(room_no))
        if room is None:
            return jsonify({"error": "Room not found"}), 404
        
        if room.is_booked:
            return jsonify({"error": "Cannot delete booked room. Unbook it first"}), 400
        
        hotel.rooms.remove(room)
        persist()
        return jsonify({"ok": True}), 200

    @app.get("/stats")
    def get_stats():
        total_rooms = len(hotel.rooms)
        available = len(hotel.get_available_rooms())
        booked = len(hotel.get_booked_rooms())
        
        # Calculate revenue from bookings
        revenue = 0
        for room_no, booking in hotel._bookings.items():
            room = hotel.get_room(room_no)
            if room:
                check_in = datetime.fromisoformat(booking.check_in)
                check_out = datetime.fromisoformat(booking.check_out)
                days = (check_out - check_in).days
                revenue += room.price * days
        
        occupancy_rate = (booked / total_rooms * 100) if total_rooms > 0 else 0
        
        return jsonify({
            "totalRooms": total_rooms,
            "availableRooms": available,
            "bookedRooms": booked,
            "revenue": revenue,
            "occupancyRate": round(occupancy_rate, 2)
        })

    @app.post("/rooms/<room_no>/checkin")
    def checkin_room(room_no: str):
        room = hotel.get_room(str(room_no))
        if room is None:
            return jsonify({"error": "Room not found"}), 404
        if not room.is_booked:
            return jsonify({"error": "Room is not booked"}), 400
        if room_no not in hotel._bookings:
            return jsonify({"error": "Booking not found"}), 404
        
        booking = hotel._bookings[room_no]
        if booking.checked_in:
            return jsonify({"error": "Guest already checked in"}), 400
        
        booking.checked_in = True
        booking.check_in_time = datetime.now().isoformat()
        persist()
        return jsonify({"ok": True, "checkInTime": booking.check_in_time}), 200

    @app.post("/rooms/<room_no>/checkout")
    def checkout_room(room_no: str):
        room = hotel.get_room(str(room_no))
        if room is None:
            return jsonify({"error": "Room not found"}), 404
        if not room.is_booked:
            return jsonify({"error": "Room is not booked"}), 400
        if room_no not in hotel._bookings:
            return jsonify({"error": "Booking not found"}), 404
        
        booking = hotel._bookings[room_no]
        if booking.checked_out:
            return jsonify({"error": "Guest already checked out"}), 400
        
        booking.checked_out = True
        booking.check_out_time = datetime.now().isoformat()
        # Auto unbook after checkout
        hotel.unbook_room(str(room_no))
        persist()
        return jsonify({"ok": True, "checkOutTime": booking.check_out_time}), 200

    @app.put("/rooms/<room_no>/status")
    def update_room_status(room_no: str):
        data = request.get_json(force=True)
        status = data.get("status")
        notes = data.get("notes")
        
        room = hotel.get_room(str(room_no))
        if room is None:
            return jsonify({"error": "Room not found"}), 404
        
        if status and status in ["available", "maintenance", "cleaning"]:
            room.status = status
        if notes is not None:
            room.notes = notes
        
        persist()
        return jsonify(room_to_public(room)), 200

    @app.put("/rooms/<room_no>/amenities")
    def update_room_amenities(room_no: str):
        data = request.get_json(force=True)
        amenities = data.get("amenities", [])
        
        room = hotel.get_room(str(room_no))
        if room is None:
            return jsonify({"error": "Room not found"}), 404
        
        room.amenities = amenities if isinstance(amenities, list) else []
        persist()
        return jsonify(room_to_public(room)), 200

    @app.put("/rooms/<room_no>/booking")
    def modify_booking(room_no: str):
        data = request.get_json(force=True)
        room = hotel.get_room(str(room_no))
        if room is None or room_no not in hotel._bookings:
            return jsonify({"error": "Booking not found"}), 404
        
        booking = hotel._bookings[room_no]
        
        if "checkIn" in data:
            booking.check_in = data["checkIn"]
        if "checkOut" in data:
            booking.check_out = data["checkOut"]
        if "guestCount" in data:
            booking.guest_count = data["guestCount"]
        if "notes" in data:
            booking.notes = data["notes"]
        if "guestEmail" in data:
            booking.guest_email = data["guestEmail"]
        if "guestPhone" in data:
            booking.guest_phone = data["guestPhone"]
        
        persist()
        return jsonify({"ok": True}), 200

    @app.get("/guests")
    def list_guests():
        guests = {}
        for room_no, booking in hotel._bookings.items():
            guest_name = booking.guest_name
            if guest_name not in guests:
                guests[guest_name] = {
                    "name": guest_name,
                    "email": booking.guest_email,
                    "phone": booking.guest_phone,
                    "totalBookings": 0,
                    "bookings": []
                }
            guests[guest_name]["totalBookings"] += 1
            guests[guest_name]["bookings"].append({
                "roomNo": room_no,
                "checkIn": booking.check_in,
                "checkOut": booking.check_out,
                "confirmationNumber": booking.confirmation_number,
                "checkedIn": booking.checked_in,
                "checkedOut": booking.checked_out
            })
        return jsonify(list(guests.values()))

    @app.get("/notifications")
    def get_notifications():
        notifications = []
        today = datetime.now().date()
        
        for room_no, booking in hotel._bookings.items():
            check_out_date = datetime.fromisoformat(booking.check_out).date()
            days_until_checkout = (check_out_date - today).days
            
            if days_until_checkout == 0 and not booking.checked_out:
                notifications.append({
                    "type": "checkout_today",
                    "message": f"Room {room_no} checkout today - Guest: {booking.guest_name}",
                    "roomNo": room_no,
                    "priority": "high"
                })
            elif days_until_checkout == 1:
                notifications.append({
                    "type": "checkout_tomorrow",
                    "message": f"Room {room_no} checkout tomorrow - Guest: {booking.guest_name}",
                    "roomNo": room_no,
                    "priority": "medium"
                })
        
        # Check for maintenance rooms
        for room in hotel.rooms:
            if room.status == "maintenance":
                notifications.append({
                    "type": "maintenance",
                    "message": f"Room {room.number} is under maintenance",
                    "roomNo": room.number,
                    "priority": "medium"
                })
        
        return jsonify(notifications)

    return app


if __name__ == "__main__":
    # Local dev entrypoint: python -m backend.app
    app = create_app()
    app.run(host="127.0.0.1", port=5000, debug=True)


