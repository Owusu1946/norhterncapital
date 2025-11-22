# Room Management System Documentation

## Overview
The room management system allows hotel administrators to manage room types and individual rooms with capacity enforcement.

## Features

### Room Types Management
- **Create Room Types**: Define room categories with specifications
- **Set Capacity Limits**: Each room type has a maximum number of rooms that can be created
- **Track Availability**: Real-time tracking of created vs. available room capacity
- **Currency**: All prices are in Ghana Cedis (₵)

### Room Creation
- **Add Individual Rooms**: Create rooms by selecting from existing room types
- **Automatic Capacity Enforcement**: System prevents creating more rooms than the defined limit
- **Room Status Tracking**: Each room has a status (available, occupied, maintenance, reserved)
- **Floor Assignment**: Automatic floor detection from room number (e.g., room 205 = floor 2)

## Usage Guide

### 1. Create Room Types First
Navigate to `/admin/rooms/add-room-type` and click "Add new" to create a room type.

**Required fields:**
- **Name**: e.g., "Deluxe Suite"
- **Slug**: URL-friendly identifier (auto-generated)
- **Price per night**: In Cedis (₵)
- **Size**: e.g., "32 m²"
- **Bed type**: e.g., "King bed"
- **Total rooms**: Maximum number of rooms of this type (e.g., 10)
- **Max guests/adults/children**: Occupancy limits

### 2. Add Individual Rooms
Navigate to `/admin/rooms/add-room` to create individual room instances.

**Process:**
1. Select a room type from the dropdown
2. Enter a room number (e.g., "205")
3. Click "Add room"
4. System will show remaining capacity after each addition

**Capacity Enforcement:**
- If a room type has `totalRooms: 10`, you can only create 10 rooms of that type
- The system displays warnings when approaching capacity
- The "Add room" button is disabled when capacity is reached

### 3. Monitor Room Status
The room types page shows:
- **Total Rooms**: Maximum capacity for the room type
- **Created**: Number of rooms already created
- **Available**: Number of available (unoccupied) rooms
- **Capacity**: Adults + Children format (e.g., "2A + 1C")

## API Endpoints

### Room Types
```
GET /api/room-types
- Fetch all room types with capacity information

POST /api/room-types
- Create a new room type
- Required: name, slug, pricePerNight, size, bedType, maxGuests, totalRooms
```

### Rooms
```
GET /api/rooms
- Fetch all rooms
- Optional query params: ?roomType=slug&status=available

POST /api/rooms
- Create a new room
- Required: roomNumber, roomTypeId
- Enforces capacity limits

DELETE /api/rooms
- Soft delete a room (marks as inactive)
- Required: roomId
```

## Database Schema

### RoomType Model
```javascript
{
  slug: String (unique),
  name: String,
  description: String,
  pricePerNight: Number,
  size: String,
  bedType: String,
  maxGuests: Number,
  maxAdults: Number,
  maxChildren: Number,
  totalRooms: Number, // Maximum capacity
  amenities: [String],
  perks: [String],
  isActive: Boolean
}
```

### Room Model
```javascript
{
  roomNumber: String (unique),
  roomTypeId: ObjectId,
  roomTypeSlug: String,
  roomTypeName: String,
  floor: Number,
  status: String, // "available" | "occupied" | "maintenance" | "reserved"
  isActive: Boolean,
  notes: String
}
```

## Error Handling

The system provides clear error messages for:
- Attempting to exceed room capacity
- Duplicate room numbers
- Invalid room type selection
- Missing required fields

## Best Practices

1. **Plan Room Types**: Define all room types before creating individual rooms
2. **Set Realistic Capacities**: Consider your hotel's actual room inventory
3. **Use Consistent Numbering**: Follow a logical room numbering scheme
4. **Regular Monitoring**: Check the room status dashboard regularly
5. **Update Status**: Keep room statuses updated (available/occupied/maintenance)

## Troubleshooting

**Q: Why can't I add more rooms?**
A: Check if you've reached the maximum capacity for that room type. You'll need to increase the `totalRooms` value in the room type settings.

**Q: Room numbers are not unique?**
A: Each room must have a unique room number across all room types. Use a consistent numbering scheme like floor + room number (e.g., 101, 102, 201, 202).

**Q: Prices not showing correctly?**
A: Ensure prices are entered as numbers without currency symbols. The system automatically formats them with the Cedis symbol (₵).
