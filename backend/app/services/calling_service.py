import random
import asyncio
from datetime import datetime
from typing import Dict, Any

class CallingService:
    @staticmethod
    async def simulate_call(campaign_id: str, invitee_id: str, campaign_invitee_id: str, invitee_name: str, attempt: int) -> Dict[str, Any]:
        # Latency simulation
        await asyncio.sleep(0.5)

        # Outcomes: confirmed, declined, undecided, failed
        rand = random.random()
        duration = random.randint(15, 45)
        
        if rand < 0.55:
            rsvp_status = "confirmed"
            call_status = "completed"
            error = None
            notes = "Confirmed attendance over voice call. Requested vegetarian meal."
            transcript = [
                {"speaker": "AI", "message": f"Hello {invitee_name}, calling from GlobalVox for the event. Will you be attending?"},
                {"speaker": "Invitee", "message": "Yes, absolutely! Mark me down as attending."},
                {"speaker": "AI", "message": "Great, looking forward to seeing you!"}
            ]
        elif rand < 0.70:
            rsvp_status = "declined"
            call_status = "completed"
            error = None
            notes = "Declined due to prior business travel clash."
            transcript = [
                {"speaker": "AI", "message": f"Hi {invitee_name}, calling from GlobalVox regarding the event."},
                {"speaker": "Invitee", "message": "Sorry, I am out of the country that week."},
                {"speaker": "AI", "message": "Thank you for letting us know."}
            ]
        elif rand < 0.85:
            rsvp_status = "undecided"
            call_status = "completed"
            error = None
            notes = "Undecided. Will confirm schedule by end of week."
            transcript = [
                {"speaker": "AI", "message": f"Hello {invitee_name}, reaching out for your event RSVP status."},
                {"speaker": "Invitee", "message": "I need to check my team calendar first."},
                {"speaker": "AI", "message": "Understood, marked as undecided."}
            ]
        else:
            rsvp_status = None
            call_status = random.choice(["no_answer", "error", "invalid_number"])
            duration = random.randint(3, 10)
            error = f"CALL_FAILED_{call_status.upper()}"
            notes = f"Call attempt {attempt} failed ({error})."
            transcript = []

        return {
            "campaignId": campaign_id,
            "inviteeId": invitee_id,
            "campaignInviteeId": campaign_invitee_id,
            "attempt": attempt,
            "callStatus": call_status,
            "rsvpStatus": rsvp_status,
            "duration": duration,
            "error": error,
            "notes": notes,
            "transcript": transcript,
            "rawResponse": {
                "provider": "GlobalVox-AI-Voice-Engine",
                "session_id": f"sess_{random.randint(10000, 99999)}",
                "call_status": call_status
            },
            "startedAt": datetime.utcnow(),
            "completedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow()
        }
