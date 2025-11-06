class AbstractRoom {
  constructor(number, price) {
    if (this.constructor === AbstractRoom) throw new Error("Cannot instantiate abstract class!");
    this.number = number;
    this.price = price;
    this.isBooked = false;
    this.bookedBy = null;
  }
  getDescription() { throw new Error("Must override getDescription()"); }
}

class SingleRoom extends AbstractRoom {
  getDescription() { return `Single Room — ₹${this.price}`; }
}
class DoubleRoom extends AbstractRoom {
  getDescription() { return `Double Room — ₹${this.price}`; }
}
class SuiteRoom extends AbstractRoom {
  getDescription() { return `Luxury Suite — ₹${this.price}`; }
}

class Booking {
  #guestName;
  #checkIn;
  #checkOut;
  constructor(guestName, checkIn, checkOut) {
    this.#guestName = guestName;
    this.#checkIn = checkIn;
    this.#checkOut = checkOut;
  }
  get guestName() { return this.#guestName; }
  get checkIn() { return this.#checkIn; }
  get checkOut() { return this.#checkOut; }
}

class Hotel {
  constructor() {
    this.rooms = [];
    this.bookings = [];
  }
  addRoom(room) {
    if (this.rooms.find(r => r.number === room.number)) {
      alert("Room already exists!");
      return;
    }
    this.rooms.push(room);
    this.save();
  }
  getAvailableRooms() { return this.rooms.filter(r => !r.isBooked); }
  getBookedRooms() { return this.rooms.filter(r => r.isBooked); }
  bookRoom(roomNo, booking) {
    const room = this.rooms.find(r => r.number == roomNo);
    if (!room) return alert("Room not found!");
    if (room.isBooked) return alert("Room already booked!");
    room.isBooked = true;
    room.bookedBy = booking.guestName;
    this.bookings.push({ roomNo, booking });
    this.save();
  }
  unbookRoom(roomNo) {
    const room = this.rooms.find(r => r.number == roomNo);
    if (!room) return alert("Room not found!");
    room.isBooked = false;
    room.bookedBy = null;
    this.bookings = this.bookings.filter(b => b.roomNo != roomNo);
    this.save();
  }
  save() {
    localStorage.setItem('hotelData', JSON.stringify({
      rooms: this.rooms,
      bookings: this.bookings
    }));
  }
  load() {
    const data = JSON.parse(localStorage.getItem('hotelData') || '{}');
    if (data.rooms) {
      this.rooms = data.rooms.map(r => {
        let room;
        if (r.constructorName === 'SingleRoom' || r.type === 'SingleRoom') room = new SingleRoom(r.number, r.price);
        else if (r.constructorName === 'DoubleRoom' || r.type === 'DoubleRoom') room = new DoubleRoom(r.number, r.price);
        else room = new SuiteRoom(r.number, r.price);
        room.isBooked = r.isBooked;
        room.bookedBy = r.bookedBy;
        return room;
      });
    }
    if (data.bookings) this.bookings = data.bookings;
  }
}

const hotel = new Hotel();
hotel.load();

const roomNo = document.getElementById("roomNo");
const roomType = document.getElementById("roomType");
const roomPrice = document.getElementById("roomPrice");
const addRoomBtn = document.getElementById("addRoomBtn");
const guestName = document.getElementById("guestName");
const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");
const availableRooms = document.getElementById("availableRooms");
const bookedRooms = document.getElementById("bookedRooms");

addRoomBtn.onclick = () => {
  const num = roomNo.value.trim();
  const price = Number(roomPrice.value);
  if (!num || !price) return alert("Enter all details!");
  let room;
  if (roomType.value === "SingleRoom") room = new SingleRoom(num, price);
  else if (roomType.value === "DoubleRoom") room = new DoubleRoom(num, price);
  else room = new SuiteRoom(num, price);
  hotel.addRoom(room);
  renderRooms();
  roomNo.value = ""; roomPrice.value = "";
};

function bookRoom(roomNo) {
  const guest = guestName.value.trim();
  if (!guest || !checkIn.value || !checkOut.value) {
    alert("Enter guest name and dates before booking!");
    return;
  }
  const booking = new Booking(guest, checkIn.value, checkOut.value);
  hotel.bookRoom(roomNo, booking);
  renderRooms();
}

function unbookRoom(roomNo) {
  hotel.unbookRoom(roomNo);
  renderRooms();
}

function renderRooms() {
  availableRooms.innerHTML = "";
  bookedRooms.innerHTML = "";
  const available = hotel.getAvailableRooms();
  const booked = hotel.getBookedRooms();
  if (!available.length) availableRooms.innerHTML = "<p>No available rooms</p>";
  else available.forEach(r => {
    const div = document.createElement("div");
    div.className = "room-item";
    div.innerHTML = `
      <div class="room-header">
        <b>Room ${r.number}</b>
        <span class="status available">Available</span>
      </div>
      <p>${r.getDescription()}</p>
      <button class="btn-inline btn-book" onclick="bookRoom('${r.number}')">Book Room</button>
    `;
    availableRooms.appendChild(div);
  });
  if (!booked.length) bookedRooms.innerHTML = "<p>No booked rooms</p>";
  else booked.forEach(r => {
    const div = document.createElement("div");
    div.className = "room-item";
    div.innerHTML = `
      <div class="room-header">
        <b>Room ${r.number}</b>
        <span class="status booked">Booked</span>
      </div>
      <p>${r.getDescription()}<br>Guest: <b>${r.bookedBy}</b></p>
      <button class="btn-inline btn-unbook" onclick="unbookRoom('${r.number}')">Unbook Room</button>
    `;
    bookedRooms.appendChild(div);
  });
}

renderRooms();
