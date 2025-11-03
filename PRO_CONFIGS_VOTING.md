# Pro Configs Voting System

## Overview

The Pro Configs feature includes a robust voting system with the following protections:

### ✅ One Vote Per User
- Each IP address can only vote once per config
- Users can change their vote (upvote ↔ downvote)
- Vote status is tracked in `ProConfigVote` table
- Vote changes update the aggregate count correctly (+2 or -2)

### ✅ Rate Limiting
- **Limit**: 10 votes per hour per IP address
- **Response**: 429 Too Many Requests when exceeded
- Prevents spam and abuse

### ✅ Visual Feedback
- Highlights show which way you voted (green upvote, red downvote)
- Error messages for rate limits and duplicate votes
- Disabled state while vote is processing
- Auto-clearing error messages (2-3 seconds)

## Database Schema

### ProConfig
```prisma
model ProConfig {
  id           String          @id @default(cuid())
  name         String
  game         String
  votes        Int             @default(0)  // Aggregate vote count
  userVotes    ProConfigVote[]              // Individual vote records
  // ... other fields
}
```

### ProConfigVote
```prisma
model ProConfigVote {
  id            String     @id @default(cuid())
  configId      String
  config        ProConfig  @relation(...)
  userId        String?    // For future auth integration
  ipAddress     String     // For anonymous tracking
  vote          Int        // 1 or -1
  createdAt     DateTime
  
  @@unique([configId, userId, ipAddress])
}
```

## API Endpoints

### GET /api/pro-configs
**Query Parameters:**
- `checkVotes=true` - Include user's vote status

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "name": "s1mple",
      "votes": 42,
      "userVote": 1,  // 1, -1, or null
      // ... other fields
    }
  ]
}
```

### POST /api/pro-configs
**Request Body:**
```json
{
  "id": "config-id",
  "vote": 1  // or -1
}
```

**Success Response:**
```json
{
  "success": true,
  "votes": 43,
  "message": "Vote registered successfully"
}
```

**Already Voted (Same Vote):**
```json
{
  "success": false,
  "alreadyVoted": true,
  "currentVote": 1,
  "message": "You have already voted"
}
```

**Vote Changed:**
```json
{
  "success": true,
  "votes": 41,
  "message": "Vote changed successfully",
  "previousVote": 1,
  "newVote": -1
}
```

**Rate Limited:**
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```
Status: 429

## Frontend Integration

### Fetching Configs with Vote Status
```javascript
const params = new URLSearchParams({
  game: 'cs2',
  checkVotes: 'true'  // Include user's votes
});

const res = await fetch(`/api/pro-configs?${params}`);
const data = await res.json();
```

### Handling Votes
```javascript
const handleVote = async (id, vote) => {
  const res = await fetch('/api/pro-configs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, vote })
  });
  
  const data = await res.json();
  
  if (data.success) {
    // Update UI with new vote count
    updateConfig(id, { votes: data.votes, userVote: vote });
  } else if (data.alreadyVoted) {
    // Show "already voted" message
  }
};
```

## Migration

Run this SQL to add the voting table:

```sql
-- See add-proconfig-votes-table.sql
npx prisma db push
```

Or use Prisma:
```bash
npx prisma migrate dev --name add-proconfig-votes
```

## Security Features

1. **IP-Based Tracking**: Uses `x-forwarded-for` and `x-real-ip` headers
2. **Rate Limiting**: 10 votes/hour prevents abuse
3. **Transaction Safety**: Vote changes use database transactions
4. **Validation**: Server-side validation of vote values (±1 only)
5. **Cascade Delete**: Votes are deleted when configs are deleted

## Future Enhancements

- [ ] User authentication integration (userId field ready)
- [ ] Admin override for vote manipulation detection
- [ ] Vote analytics dashboard
- [ ] Trending configs based on recent votes
- [ ] Vote history per user
