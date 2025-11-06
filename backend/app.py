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
        # Include booking dates if room is booked
        if room.is_booked and room.number in hotel._bookings:
            booking = hotel._bookings[room.number]
            result["checkIn"] = booking.check_in
            result["checkOut"] = booking.check_out
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
        try:
            booking = Booking(guest_name=guest, check_in=check_in, check_out=check_out)
            hotel.book_room(str(room_no), booking)
            persist()
            return jsonify({"ok": True}), 200
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

    return app


if __name__ == "__main__":
    # Local dev entrypoint: python -m backend.app
    app = create_app()
    app.run(host="127.0.0.1", port=5000, debug=True)


