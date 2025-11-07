# Title: Prepare a Use Case Model for Hotel Management System (HotelWise)

## Theory:

A Use Case Model represents the functional behavior of a system as perceived by its external users, called actors. It defines what the system does without describing how it is implemented. Each use case depicts a specific function or goal achieved through the interaction between an actor and the system.

The Use Case Diagram helps to:

• Identify major functionalities of the system.

• Visualize system boundaries.

• Define how different users (actors) interact with the system.

---

## Actors in the HotelWise System

1. **Administrator/Staff** – Manages room inventory, handles bookings, performs check-in/check-out operations, views statistics, manages guest records, and updates room statuses.

2. **Guest** – Books rooms, views booking details, receives confirmation numbers, and provides guest information for reservations.

3. **System (HotelWise Backend)** – Handles automatic calculations (cost, revenue, occupancy rate), generates confirmation numbers, validates dates, manages notifications, and prevents booking conflicts.

---

## Use Case Specifications

________________________________________

### Use Case 1: Room Management & Inventory Control

• **Actors**: Administrator, System

• **Description**: Allows administrators to add new rooms with different types (Single, Double, Suite), update room details (price, type, amenities), delete rooms, and manage room statuses (available, maintenance, cleaning). The system validates room numbers to prevent duplicates and ensures booked rooms cannot be deleted.

• **Precondition**: Administrator is logged into the system.

• **Postcondition**: Room inventory is updated and persisted in the system.

• **Normal Flow**:

1. Administrator navigates to Room Management section.

2. Administrator selects action (Add/Update/Delete/Update Status).

3. For Add: Enters room number, price, and type.

4. System validates room number uniqueness.

5. System creates room instance based on type (SingleRoom/DoubleRoom/SuiteRoom).

6. Room is added to inventory and saved.

7. For Update: Administrator modifies room price, type, or amenities.

8. System validates that room is not currently booked.

9. System updates room details and persists changes.

10. For Status Update: Administrator changes room status (available/maintenance/cleaning).

11. System updates status and displays updated room list.

• **Alternate Flow**: 
   - Duplicate room number → System shows error "Room already exists".
   - Attempt to delete booked room → System shows error "Cannot delete booked room. Unbook it first".
   - Attempt to update booked room → System shows error "Cannot update booked room".

________________________________________

### Use Case 2: Room Booking & Reservation Management

• **Actors**: Administrator, Guest, System

• **Description**: Enables booking of available rooms with automatic date validation, cost calculation, and confirmation number generation. The system prevents double-booking and validates check-in/check-out dates.

• **Precondition**: Room exists and is available. Guest information is provided.

• **Postcondition**: Room is booked, confirmation number is generated, and booking details are stored.

• **Normal Flow**:

1. Administrator or Guest selects an available room.

2. Administrator enters guest details (name, email, phone, guest count).

3. Administrator selects check-in and check-out dates.

4. System validates that check-out date is after check-in date.

5. System checks room availability status.

6. System calculates total cost based on room price and number of nights.

7. System generates unique 8-character confirmation number.

8. System creates Booking object with all details.

9. System marks room as booked and links booking to room.

10. System displays booking summary with confirmation number.

11. Booking details are persisted to storage.

• **Alternate Flow**: 
   - Invalid date range → System shows error and prevents booking.
   - Room already booked → System shows error "Room already booked".
   - Room in maintenance → System shows error "Room is not available for booking (status: maintenance)".

________________________________________

### Use Case 3: Check-In & Check-Out Operations

• **Actors**: Administrator, System

• **Description**: Handles guest check-in and check-out processes, records timestamps, and automatically updates room status. System prevents duplicate check-ins and auto-unbooks room after checkout.

• **Precondition**: Room is booked and guest has valid booking.

• **Postcondition**: Guest is checked in/out, timestamps are recorded, and room status is updated.

• **Normal Flow**:

**Check-In:**

1. Administrator navigates to booking details.

2. Administrator selects "Check-In" for a booked room.

3. System validates that room is booked and not already checked in.

4. System records current timestamp as check-in time.

5. System marks booking as checked in.

6. Room status remains booked.

7. Changes are persisted.

**Check-Out:**

1. Administrator selects "Check-Out" for a checked-in room.

2. System validates that guest is checked in.

3. System records current timestamp as check-out time.

4. System marks booking as checked out.

5. System automatically unbooks the room (sets is_booked to false).

6. Room status changes to available.

7. Changes are persisted.

• **Alternate Flow**: 
   - Attempt to check in already checked-in guest → System shows error "Guest already checked in".
   - Attempt to check out without check-in → System shows error "Room is not booked".

________________________________________

### Use Case 4: Guest Management & History Tracking

• **Actors**: Administrator, System

• **Description**: Provides comprehensive guest profile management, including viewing all guests, tracking booking history, and accessing guest contact information. System aggregates booking data to create guest profiles.

• **Precondition**: System has booking records with guest information.

• **Postcondition**: Administrator views complete guest information and booking history.

• **Normal Flow**:

1. Administrator navigates to Guest Management section.

2. System retrieves all bookings from storage.

3. System aggregates bookings by guest name.

4. System creates guest profiles with:
   - Guest name, email, phone
   - Total number of bookings
   - List of all bookings with room numbers, dates, confirmation numbers, and status

5. System displays guest list with booking counts.

6. Administrator selects a guest to view detailed history.

7. System displays all bookings for selected guest including:
   - Room numbers
   - Check-in and check-out dates
   - Confirmation numbers
   - Booking status (Booked/Checked In/Checked Out)

8. Administrator can view guest contact information for communication.

• **Alternate Flow**: 
   - No guests found → System displays "No guests found" message.
   - Guest with no bookings → Guest profile shows zero bookings.

________________________________________

### Use Case 5: Analytics & Statistics Dashboard

• **Actors**: Administrator, System

• **Description**: Provides real-time analytics including total rooms, available rooms, booked rooms, revenue calculations, and occupancy rate. System automatically calculates metrics from current data and displays visual indicators.

• **Precondition**: System has room and booking data.

• **Postcondition**: Administrator views comprehensive statistics and KPIs.

• **Normal Flow**:

1. Administrator navigates to Dashboard section.

2. System retrieves all rooms and bookings.

3. System calculates:
   - Total rooms count
   - Available rooms (not booked and status = available)
   - Booked rooms count
   - Revenue: Sum of (room price × number of nights) for all bookings
   - Occupancy rate: (Booked rooms / Total rooms) × 100

4. System displays statistics in dashboard cards:
   - Total Rooms
   - Available Rooms
   - Booked Rooms
   - Total Revenue (formatted with currency)
   - Occupancy Rate (percentage with progress bar)

5. System updates visual progress bar for occupancy rate.

6. Administrator can refresh statistics to get latest data.

• **Alternate Flow**: 
   - No rooms in system → All statistics show zero.
   - Division by zero for occupancy → System displays 0% occupancy rate.

________________________________________

### Use Case 6: Booking Modification & Updates

• **Actors**: Administrator, System

• **Description**: Allows administrators to modify existing booking details such as check-in/check-out dates, guest count, contact information, and notes. System validates changes and updates booking records.

• **Precondition**: Booking exists and is not checked out.

• **Postcondition**: Booking details are updated and persisted.

• **Normal Flow**:

1. Administrator navigates to booking details.

2. Administrator selects "Modify Booking" option.

3. Administrator updates fields (dates, guest count, email, phone, notes).

4. System validates new check-in/check-out dates.

5. System updates Booking object with new information.

6. System persists updated booking to storage.

7. System displays success message and updated booking details.

• **Alternate Flow**: 
   - Invalid date range → System shows error and rejects update.
   - Booking not found → System shows error "Booking not found".

________________________________________

### Use Case 7: Room Search & Filtering

• **Actors**: Administrator, System

• **Description**: Enables administrators to search for rooms by room number and filter rooms by status (available, booked, all). System performs real-time search and displays matching results.

• **Precondition**: System has rooms in inventory.

• **Postcondition**: Administrator views filtered room list based on search criteria.

• **Normal Flow**:

1. Administrator navigates to Rooms section.

2. Administrator enters search term in search box.

3. System filters rooms where room number contains search term.

4. Administrator selects filter option (All/Available/Booked).

5. System applies both search and status filter.

6. System displays matching rooms with their details.

7. Results update in real-time as administrator types.

• **Alternate Flow**: 
   - No matching rooms → System displays "No rooms found" message.
   - Empty search → System displays all rooms based on selected filter.

________________________________________

### Use Case 8: Automated Notifications & Alerts

• **Actors**: System, Administrator

• **Description**: System automatically generates and displays notifications for important events such as upcoming checkouts, rooms under maintenance, and operational alerts. Notifications are prioritized and displayed in dashboard.

• **Precondition**: System has bookings and room status data.

• **Postcondition**: Administrator views relevant notifications and takes appropriate action.

• **Normal Flow**:

1. System periodically checks booking and room data.

2. System identifies:
   - Checkouts happening today (not checked out yet)
   - Checkouts happening tomorrow
   - Rooms with maintenance status

3. System creates notification objects with:
   - Type (checkout_today, checkout_tomorrow, maintenance)
   - Message describing the alert
   - Room number
   - Priority level (high/medium)

4. System displays notifications in dashboard.

5. Administrator views notifications and takes action (e.g., prepare room for checkout, schedule maintenance completion).

6. System updates notifications as conditions change.

• **Alternate Flow**: 
   - No alerts → System displays empty notifications list.
   - Multiple alerts → System displays all notifications sorted by priority.

________________________________________

### Use Case 9: Room Unbooking & Cancellation

• **Actors**: Administrator, System

• **Description**: Allows administrators to cancel bookings and unbook rooms. System releases the room for new bookings and removes booking records.

• **Precondition**: Room is booked and booking exists.

• **Postcondition**: Room is unbooked and available for new reservations.

• **Normal Flow**:

1. Administrator navigates to booking or room details.

2. Administrator selects "Unbook" or "Cancel Booking" option.

3. System validates that room is booked.

4. System removes booking from bookings dictionary.

5. System sets room.is_booked to false.

6. System clears room.booked_by field.

7. System updates room status to available.

8. Changes are persisted to storage.

9. System displays success message.

• **Alternate Flow**: 
   - Room not found → System shows error "Room not found".
   - Room not booked → System shows error "Room is not booked".

________________________________________

---

## Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HotelWise Management System                      │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                   │
│  │  Room Management     │  │  Booking Management   │                   │
│  │  & Inventory         │  │  & Reservations       │                   │
│  └──────────────────────┘  └──────────────────────┘                   │
│           ▲                         ▲                                   │
│           │                         │                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐                   │
│  │  Check-In/Check-Out   │  │  Booking Modification│                   │
│  │  Operations           │  │  & Updates            │                   │
│  └──────────────────────┘  └──────────────────────┘                   │
│           ▲                         ▲                                   │
│           │                         │                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐                   │
│  │  Guest Management    │  │  Room Search &       │                   │
│  │  & History Tracking  │  │  Filtering           │                   │
│  └──────────────────────┘  └──────────────────────┘                   │
│           ▲                         ▲                                   │
│           │                         │                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐                   │
│  │  Analytics &       │  │  Automated             │                   │
│  │  Statistics          │  │  Notifications       │                   │
│  │  Dashboard           │  │  & Alerts            │                   │
│  └──────────────────────┘  └──────────────────────┘                   │
│           ▲                         ▲                                   │
│           │                         │                                   │
│  ┌──────────────────────┐                                           │
│  │  Room Unbooking &    │                                           │
│  │  Cancellation        │                                           │
│  └──────────────────────┘                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
           ▲                    ▲                    ▲
           │                    │                    │
           │                    │                    │
    ┌──────┴──────┐      ┌──────┴──────┐      ┌──────┴──────┐
    │             │      │             │      │             │
    │Administrator│      │    Guest    │      │   System    │
    │             │      │             │      │             │
    └─────────────┘      └─────────────┘      └─────────────┘
```

**Legend:**
- **Administrator** (Staff) - Primary actor managing all hotel operations
- **Guest** - Secondary actor providing booking information
- **System** - Automated actor handling calculations, validations, and notifications

**Use Cases:**
1. Room Management & Inventory Control
2. Room Booking & Reservation Management
3. Check-In & Check-Out Operations
4. Guest Management & History Tracking
5. Analytics & Statistics Dashboard
6. Booking Modification & Updates
7. Room Search & Filtering
8. Automated Notifications & Alerts
9. Room Unbooking & Cancellation

---

## Conclusion:

The Use Case Model for the HotelWise System effectively captures all primary interactions between users and the system. By defining key actors such as Administrator, Guest, and System, and mapping their functionalities like room management, booking operations, guest tracking, analytics, and automated notifications, the model provides a structured understanding of the system's functionality.

This helps visualize how HotelWise supports comprehensive hotel operations including inventory management, reservation handling, guest services, and data-driven decision making before moving into design and implementation. The use cases demonstrate the system's ability to handle complex hotel management scenarios while maintaining data integrity and operational efficiency.

