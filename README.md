## Hotel Management System — Frontend + Python OOP Backend

This project adds a Python backend (Flask) using OOP principles to your existing HTML/CSS/JS frontend. The backend persists data to a local JSON file and exposes a small REST API for managing rooms and bookings.

### What you get
- OOP models: `AbstractRoom`, `SingleRoom`, `DoubleRoom`, `SuiteRoom`, `Booking`, and an aggregate `Hotel`.
- JSON repository: `JsonHotelRepository` to load/save hotel state.
- REST API (Flask) with CORS enabled.
- Frontend updated to call the API via `fetch` instead of using `localStorage`.

### Folder structure
- `index.html`, `index.css`, `index.js` — Frontend UI
- `backend/models.py` — OOP classes (rooms, booking, hotel)
- `backend/storage.py` — JSON repository
- `backend/app.py` — Flask app exposing endpoints
- `requirements.txt` — Python dependencies

---

## 1) Setup (Windows PowerShell)

1. Open PowerShell in the project folder:
   ```bash
   cd "C:\Users\ASUS\OneDrive\Desktop\OOMD_PROJECT"
   ```
2. Create a virtual environment (recommended):
   ```bash
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 2) Run the backend

Start the Flask server (development mode):
```bash
py -m backend.app
```
This will listen on `http://127.0.0.1:5000`.

## 3) Open the frontend

Simply open `index.html` in your browser (double-click or use a static server). The JS will call the backend at `http://127.0.0.1:5000`.

If your browser blocks requests from a `file://` page to `http://127.0.0.1:5000`, you can run a quick static server instead:
```bash
py -m http.server 8080
```
Then visit `http://127.0.0.1:8080/index.html`.

---

## 4) API overview

- `GET /rooms` — list all rooms
- `GET /rooms?status=available` — list available rooms
- `GET /rooms?status=booked` — list booked rooms
- `POST /rooms` — add a room
  - JSON body: `{ "number": "101", "price": 1500, "type": "SingleRoom" }`
- `POST /rooms/<room_no>/book` — book a room
  - JSON body: `{ "guestName": "Alice", "checkIn": "2025-11-05", "checkOut": "2025-11-06" }`
- `POST /rooms/<room_no>/unbook` — unbook a room

Responses use JSON. Errors return `{ "error": "..." }` with appropriate HTTP status codes.

---

## 5) How OOP is applied (Python)

- `AbstractRoom` defines the shared shape and enforces the interface. Concrete classes (`SingleRoom`, `DoubleRoom`, `SuiteRoom`) override `get_description()`.
- `Booking` encapsulates guest and date info.
- `Hotel` acts as the aggregate root managing rooms and bookings with clear methods: `add_room`, `book_room`, `unbook_room`, `get_available_rooms`, etc.
- `JsonHotelRepository` separates persistence concerns. You could later swap this with a database without changing business logic.

Inline comments in code explain important parts and decisions.

---

## 6) Step-by-step guide (quick recap)

1. Create and activate a virtual environment.
2. `pip install -r requirements.txt`.
3. Run backend: `py -m backend.app`.
4. Open `index.html` (or serve via `py -m http.server 8080`).
5. Use the UI to add rooms, book, and unbook. State is persisted to `backend/data.json`.

---

## 7) Notes

- This is a demo-grade backend using a JSON file for persistence. For concurrency or multi-user scenarios, move to a database.
- CORS is enabled so the frontend can call the backend from a local file or static server.







